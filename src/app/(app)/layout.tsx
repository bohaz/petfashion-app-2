import { AppProvider } from '@/components/AppProvider'
import { BottomNav } from '@/components/layout/BottomNav'
import { ModalManager } from '@/components/layout/ModalManager'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen bg-stone-50 pb-20">
        <main className="max-w-md mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
      <ModalManager />
    </AppProvider>
  )
}
