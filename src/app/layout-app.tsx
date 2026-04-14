'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '@/components/layout/TopBar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 pb-24 md:pb-0 md:p-6 px-4 py-4">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
