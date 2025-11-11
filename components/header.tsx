'use client'

import { SessionProvider, signOut } from 'next-auth/react'
import { Button } from './ui/button'

export default function Header() {
	return (
		<header className='sticky flex justify-center border-b'>
			<div className='flex items-center justify-between w-full h-16 px-4 mx-auto sm:px-6'>
				<h1 className='text-primary text-xl'>библиотека зимы не будет</h1>
				<div className='ml-auto flex items-center space-x-4'>
					<SessionProvider>
						<Button variant='outline' onClick={() => signOut()}>
							выйти
						</Button>
					</SessionProvider>
				</div>
			</div>
		</header>
	)
}
