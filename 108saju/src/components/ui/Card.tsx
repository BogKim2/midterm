import type { CSSProperties, PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  className?: string
  style?: CSSProperties
}>

export function Card({ children, className = '', style }: CardProps) {
  return (
    <section className={`ui-card${className ? ` ${className}` : ''}`} style={style}>
      {children}
    </section>
  )
}
