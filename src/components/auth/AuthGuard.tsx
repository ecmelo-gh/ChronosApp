import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganization?: boolean;
  allowedRoles?: string[];
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireOrganization = true,
  allowedRoles = [],
}: AuthGuardProps) {
  const { user, loading, organization } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Usuário não autenticado, redirecionar para login
        router.push('/auth/login');
        return;
      }

      if (requireOrganization && !organization) {
        // Usuário sem organização, redirecionar para criar
        router.push('/auth/register');
        return;
      }

      if (allowedRoles.length > 0 && user) {
        const userRole = user.role;
        if (!allowedRoles.includes(userRole)) {
          // Usuário sem permissão, redirecionar para dashboard
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [loading, user, organization, requireAuth, requireOrganization, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Verificações de acesso
  if (requireAuth && !user) return null;
  if (requireOrganization && !organization) return null;
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
