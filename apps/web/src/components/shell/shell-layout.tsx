import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { DevModeBanner } from '@/components/dev-mode-banner'

export function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DevModeBanner />
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
