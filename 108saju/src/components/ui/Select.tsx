import type { SelectHTMLAttributes } from 'react'

type Option = {
  label: string
  value: string | number
}

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: Option[]
}

export function Select({ label, id, options, ...props }: Props) {
  const selectId = id || label

  return (
    <label className="ui-field" htmlFor={selectId}>
      <span className="ui-field__label">{label}</span>
      <select id={selectId} className="ui-input" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
