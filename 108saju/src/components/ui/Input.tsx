import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function Input({ label, id, ...props }: Props) {
  const inputId = id || label

  return (
    <label className="ui-field" htmlFor={inputId}>
      <span className="ui-field__label">{label}</span>
      <input id={inputId} className="ui-input" {...props} />
    </label>
  )
}
