import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventBus } from '@/lib/events';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { z } from 'zod';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import toast from 'react-hot-toast';

// Schemas
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string(),
  role: z.enum(['owner', 'manager', 'receptionist', 'professional']),
  organizationId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

type User = z.infer<typeof userSchema>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carregar usuário do token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
        const cachedUser = await redis.get(`user:${decoded.id}`);

        let userData: User;
        if (cachedUser) {
          userData = JSON.parse(cachedUser);
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: decoded.id }
          });
          
          if (!dbUser) {
            throw new Error('User not found');
          }

          userData = userSchema.parse(dbUser);
          await redis.set(`user:${decoded.id}`, JSON.stringify(userData), 'EX', 3600); // 1h cache
        }

        setUser(userData);
      } catch (error) {
        console.error('Auth load error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid login credentials');
      }

      const validPassword = await compare(password, user.password);
      if (!validPassword) {
        throw new Error('Invalid login credentials');
      }

      const userData = userSchema.parse(user);
      const token = sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

      localStorage.setItem('token', token);
      await redis.set(`user:${user.id}`, JSON.stringify(userData), 'EX', 3600);
      
      setUser(userData);

      // Publicar evento de login
      EventBus.getInstance().publish({
        type: 'USER_LOGGED_IN',
        payload: { userId: user.id },
        metadata: {
          timestamp: Date.now(),
          source: 'auth',
          version: 1
        }
      });

    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User already registered');
      }

      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          phone,
          role: 'owner' // Primeiro usuário é sempre owner
        }
      });

      // Publicar evento de registro
      EventBus.getInstance().publish({
        type: 'USER_REGISTERED',
        payload: { userId: user.id },
        metadata: {
          timestamp: Date.now(),
          source: 'auth',
          version: 1
        }
      });

    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        await redis.del(`user:${user.id}`);
        
        // Publicar evento de logout
        EventBus.getInstance().publish({
          type: 'USER_LOGGED_OUT',
          payload: { userId: user.id },
          metadata: {
            timestamp: Date.now(),
            source: 'auth',
            version: 1
          }
        });
      }

      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Retornar sucesso mesmo se usuário não existe (segurança)
        return;
      }

      // Gerar token de reset
      const resetToken = sign(
        { id: user.id, purpose: 'password-reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Salvar token no Redis
      await redis.set(
        `reset-token:${resetToken}`,
        user.id,
        'EX',
        3600 // 1h
      );

      // Publicar evento para enviar email
      EventBus.getInstance().publish({
        type: 'PASSWORD_RESET_REQUESTED',
        payload: {
          userId: user.id,
          email: user.email,
          resetToken,
          resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
        },
        metadata: {
          timestamp: Date.now(),
          source: 'auth',
          version: 1
        }
      });

    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updatePassword = async (token: string, newPassword: string) => {
    try {
      // Verificar token
      const userId = await redis.get(`reset-token:${token}`);
      if (!userId) {
        throw new Error('Invalid or expired reset token');
      }

      // Atualizar senha
      const hashedPassword = await hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      // Limpar token
      await redis.del(`reset-token:${token}`);

      // Publicar evento
      EventBus.getInstance().publish({
        type: 'PASSWORD_UPDATED',
        payload: { userId },
        metadata: {
          timestamp: Date.now(),
          source: 'auth',
          version: 1
        }
      });

      toast.success('Senha atualizada com sucesso!');
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};