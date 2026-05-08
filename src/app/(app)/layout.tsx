import { AppProvider } from '@/components/AppProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { ModalManager } from '@/components/layout/ModalManager'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--pf-bg)' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {/* mobile spacer for topbar */}
          <div className="md:hidden h-14" />
          <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 pb-10">
            {children}
          </div>
        </main>
      </div>
      <ModalManager />
    </AppProvider>
  )
}
