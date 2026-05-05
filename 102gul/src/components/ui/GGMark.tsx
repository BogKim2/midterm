interface GGMarkProps {
  size?: number
  color?: string
}

export default function GGMark({ size = 28, color = 'currentColor' }: GGMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="글결 로고"
    >
      <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="0.6" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fill={color}
        fontSize="14"
        fontFamily="'Noto Serif KR', serif"
        fontWeight="500"
      >
        결
      </text>
    </svg>
  )
}
