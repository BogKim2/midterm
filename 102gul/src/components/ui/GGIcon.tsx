type IconName =
  | 'bookmark'
  | 'bookmark-fill'
  | 'heart'
  | 'share'
  | 'pen'
  | 'search'
  | 'arrow-right'
  | 'arrow-down'
  | 'arrow-up'
  | 'moon'
  | 'sun'
  | 'plus'

interface GGIconProps {
  name: IconName
  size?: number
  stroke?: number
  color?: string
  className?: string
}

const paths: Record<IconName, React.ReactNode> = {
  'bookmark': <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" />,
  'bookmark-fill': <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" fill="currentColor" stroke="none" />,
  'heart': <path strokeLinecap="round" strokeLinejoin="round" d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0 1 12 6a5 5 0 0 1 9 2.5C21 14.5 12 21 12 21z" />,
  'share': <><path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" /><polyline strokeLinecap="round" strokeLinejoin="round" points="16 6 12 2 8 6" /><line strokeLinecap="round" x1="12" y1="2" x2="12" y2="15" /></>,
  'pen': <><path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></>,
  'search': <><circle cx="11" cy="11" r="8" /><line strokeLinecap="round" x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  'arrow-right': <><line strokeLinecap="round" x1="5" y1="12" x2="19" y2="12" /><polyline strokeLinecap="round" strokeLinejoin="round" points="12 5 19 12 12 19" /></>,
  'arrow-down': <><line strokeLinecap="round" x1="12" y1="5" x2="12" y2="19" /><polyline strokeLinecap="round" strokeLinejoin="round" points="19 12 12 19 5 12" /></>,
  'arrow-up': <><line strokeLinecap="round" x1="12" y1="19" x2="12" y2="5" /><polyline strokeLinecap="round" strokeLinejoin="round" points="5 12 12 5 19 12" /></>,
  'moon': <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  'sun': <><circle cx="12" cy="12" r="5" />{[0,45,90,135,180,225,270,315].map(a => <line key={a} strokeLinecap="round" x1={12 + 7 * Math.cos(a * Math.PI / 180)} y1={12 + 7 * Math.sin(a * Math.PI / 180)} x2={12 + 9 * Math.cos(a * Math.PI / 180)} y2={12 + 9 * Math.sin(a * Math.PI / 180)} />)}</>,
  'plus': <><line strokeLinecap="round" x1="12" y1="5" x2="12" y2="19" /><line strokeLinecap="round" x1="5" y1="12" x2="19" y2="12" /></>,
}

export default function GGIcon({ name, size = 24, stroke = 1.25, color = 'currentColor', className }: GGIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {paths[name]}
    </svg>
  )
}
