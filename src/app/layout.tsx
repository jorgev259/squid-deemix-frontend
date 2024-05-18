import type { Metadata } from 'next'

import './layout.css'

export const metadata: Metadata = {
  title: 'SQUID.WTF - Deezer Downloader',
  description: 'Generated by create next app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
