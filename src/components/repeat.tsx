import { PropsWithChildren } from 'react'

export default function Repeat(props: PropsWithChildren<{ count: number }>) {
  const { count, children } = props
  return Array(count).fill(children)
}
