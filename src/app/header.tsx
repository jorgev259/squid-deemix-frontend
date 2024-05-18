import clsx from 'clsx'
import Image from 'next/image'

import styles from '@/styles/header.module.css'

import DonateImg from '@/img/donate.png'
import DiscordImg from '@/img/discord.png'

export default function Header() {
  return (
    <div className='flex p-3 [&>*]:mx-2'>
      <a href='/' className={clsx('big ms-0', styles.link)}>
        SQUID.WTF
      </a>
      <a
        href='https://discord.gg/ATjPbzR'
        target='_blank'
        className={clsx('big', styles.link)}
      >
        <Image
          width='26'
          height='26'
          src={DiscordImg}
          alt='Discord'
          title='Discord'
        />
      </a>
      <a
        href='https://my.lyratris.com/donate/31de472c-6a1b-47bc-9939-54dbfac30990'
        target='_blank'
        className={clsx('big', styles.link)}
      >
        <Image
          width='26'
          height='26'
          src={DonateImg}
          alt='Donate'
          title='Donate'
        />
      </a>
      <a
        href='https://git.oat.zone/oat/deemix-web-frontend'
        target='_blank'
        className={clsx('big', styles.link)}
      >
        <Image
          className='git me-1.5'
          width='26'
          height='26'
          src='https://git-scm.com/images/logos/downloads/Git-Icon-White.png'
          alt=''
        />
        GIT
      </a>
    </div>
  )
}
