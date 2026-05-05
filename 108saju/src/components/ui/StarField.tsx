import './ui.css'

type StarFieldProps = {
  density?: 'low' | 'high'
}

export function StarField({ density = 'low' }: StarFieldProps) {
  const count = density === 'high' ? 80 : 36
  const stars = Array.from({ length: count }, (_, index) => ({
    id: index,
    top: `${(index * 37) % 100}%`,
    left: `${(index * 17) % 100}%`,
    delay: `${(index % 7) * 0.8}s`,
  }))

  return (
    <div className="star-field" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="star-field__star"
          style={{ top: star.top, left: star.left, animationDelay: star.delay }}
        />
      ))}
    </div>
  )
}
