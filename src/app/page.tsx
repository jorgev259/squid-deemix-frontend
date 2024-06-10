import SearchInput from '@/components/searchInput'
import Header from '../components/header'
// import Sidebar from '../components/sidebar'
import AlbumSearch from '@/components/albumSearch'

export default function Page({
  searchParams
}: {
  searchParams?: { search?: string }
}) {
  const { search } = searchParams ?? {}

  return (
    <main className='flex flex-row'>
      <div className='grow shrink basis-0 min-h-screen'>
        <Header />
        <div className='flex flex-col justify-center max-w-[600px] mx-auto px-4'>
          <SearchInput />
          <AlbumSearch search={search} />
        </div>
      </div>
      {/* <Sidebar /> */}
    </main>
  )
}
