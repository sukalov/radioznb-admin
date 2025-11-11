'use client'

import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import Link from 'next/link'

const Menu = () => {
	const activeTab = usePathname().split('/')[1]

	return (
		<nav className='flex justify-center mx-4 sm:mx-8 md:mx-12 lg:mx-24 text-xl'>
			{tabs.map((tab) => (
				<Link key={tab.id} href={`/${tab.id}`}>
					<Button
						variant='link'
						className={`${
							activeTab === tab.id ? 'text-primary underline' : 'text-gray-500'
						}`}
					>
						{tab.label}
					</Button>
				</Link>
			))}
		</nav>
	)
}

const tabs: Tabs = [
	{ id: 'programs', label: 'передачи' },
	{ id: 'people', label: 'люди' },
	{ id: 'recordings', label: 'файлы' },
	{ id: 'genres', label: 'жанры' },
]

type Tab = 'programs' | 'people' | 'recordings' | 'genres'
type Tabs = { id: Tab; label: string }[]

export default Menu
