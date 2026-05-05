import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './ui.css'

type SharedProps = {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

type LinkProps = SharedProps & {
  as: 'link'
  to: string
}

type NativeButtonProps = SharedProps & {
  as?: 'button'
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

type ButtonProps = LinkProps | NativeButtonProps

function buildClassName(variant: SharedProps['variant'] = 'primary', size: SharedProps['size'] = 'md', className = '') {
  return `ui-button ui-button--${variant} ui-button--${size}${className ? ` ${className}` : ''}`
}

export function Button(props: ButtonProps) {
  if (props.as === 'link') {
    const { children, variant = 'primary', size = 'md', className, to } = props
    return (
      <Link className={buildClassName(variant, size, className)} to={to}>
        {children}
      </Link>
    )
  }

  const { children, variant = 'primary', size = 'md', className, ...rest } = props
  return (
    <button className={buildClassName(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}
