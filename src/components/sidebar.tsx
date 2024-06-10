import clsx from 'clsx'

import styles from '@/styles/sidebar.module.css'

export default function Sidebar() {
  const queue = []

  if (queue.length < 0) return null

  return (
    <div className={clsx('w-[450px] right-[8px] p-4', styles.sidebar)}></div>
  )
}
