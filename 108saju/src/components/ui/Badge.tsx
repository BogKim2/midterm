import type { PropsWithChildren } from 'react'

type BadgeProps = PropsWithChildren<{
  tone?: 'gold' | 'purple' | 'rose' | 'muted'
}>

export function Badge({ children, tone = 'gold' }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>
}
