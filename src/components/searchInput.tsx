'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useRef, useState } from 'react'

import styles from '@/styles/searchInput.module.css'

import basedAlbums from '@/constants/basedAlbums.json'

export default function SearchInput() {
  const searchRef = useRef('')
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSearch(value: string) {
    if (value.length === 0) return
    router.push(`/?search=${value}`)
  }

  function inputChanged(ev: ChangeEvent<HTMLInputElement>) {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
    }

    const { value } = ev.target
    searchRef.current = value

    if (!value || value.length === 0) return

    const newTimer = setTimeout(handleSearch, 500, value)

    setTimer(newTimer)
  }

  function keyUp() {
    if (timer) clearTimeout(timer)
    handleSearch(searchRef.current)
  }

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
        onChange={inputChanged}
        onKeyUp={keyUp}
      />
    </div>
  )
}
