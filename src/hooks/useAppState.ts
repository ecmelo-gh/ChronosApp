import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EventBus } from '@/lib/events'

// Estado otimizado
interface AppState {
  // UI State
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info'
    message: string
  }>
  
  // Cache
  lastSync: Record<string, number>
  pendingOperations: Array<{
    id: string
    type: string
    data: unknown
    retries: number
  }>

  // Actions
  setTheme: (theme: AppState['theme']) => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<AppState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  updateLastSync: (key: string) => void
  addPendingOperation: (operation: Omit<AppState['pendingOperations'][0], 'id' | 'retries'>) => void
  removePendingOperation: (id: string) => void
}

// Store otimizado
const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial otimizado
      theme: 'light',
      sidebarOpen: true,
      notifications: [],
      lastSync: {},
      pendingOperations: [],

      // Actions otimizadas
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },

      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),

      addNotification: (notification) => {
        const id = crypto.randomUUID()
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id }
          ].slice(-5) // Manter apenas últimas 5
        }))

        // Auto-remove após 5s
        setTimeout(() => {
          get().removeNotification(id)
        }, 5000)
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

      updateLastSync: (key) => set((state) => ({
        lastSync: {
          ...state.lastSync,
          [key]: Date.now()
        }
      })),

      addPendingOperation: (operation) => {
        const id = crypto.randomUUID()
        set((state) => ({
          pendingOperations: [
            ...state.pendingOperations,
            { ...operation, id, retries: 0 }
          ]
        }))

        // Publicar evento
        EventBus.getInstance()
          .publish({
            type: 'OPERATION_PENDING',
            payload: operation,
            metadata: {
              timestamp: Date.now(),
              source: 'app-state',
              version: 1
            }
          })
          .catch(console.error)
      },

      removePendingOperation: (id) => set((state) => ({
        pendingOperations: state.pendingOperations.filter((op) => op.id !== id)
      }))
    }),
    {
      name: 'app-state',
      partialize: (state) => ({
        theme: state.theme,
        lastSync: state.lastSync
      })
    }
  )
)

export default useAppState
