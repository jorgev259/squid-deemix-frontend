'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import styles from '@/styles/searchInput.module.css'

import basedAlbums from '@/constants/basedAlbums.json'
import SearchIcon from '@/img/SearchIcon'

export default function SearchInput() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams.get('search') || ''

  return (
    <div className='flex'>
      <input
        type='search'
        className={styles.searchInput}
        placeholder={
          basedAlbums[Math.floor(Math.random() * basedAlbums.length)]
        }
        defaultValue={search}
        onChange={(ev) =>
          router.replace(
            ev.target.value.length > 0
              ? `${pathname}?search=${ev.target.value}`
              : pathname
          )
        }
      />
    </div>
  )
}
