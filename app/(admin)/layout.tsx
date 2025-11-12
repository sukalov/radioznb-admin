import Header from '@/components/header'
import { FilterBar } from '@/components/filter-bar'
import { FilterProvider } from '@/contexts/filter-context'

import '@/app/globals.css'
import Menu from '@/components/menu'

const title = 'библиотека радио знб'
const description = 'управление библиотекой'

export const metadata = {
  title,
  description,
  metadataBase: new URL('https://admin.radioznb.ru'),
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <Header />
      <div className="w-full sticky top-0 z-10 bg-background">
        <Menu />
        <FilterBar />
      </div>
      <main className="w-full">
        <div className="container mx-auto p-4 max-w-3xl">{children}</div>
      </main>
    </FilterProvider>
  )
}
