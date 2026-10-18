import type { ElementType, ReactNode } from 'react'

type ContainerProps = {
  as?: ElementType
  children: ReactNode
  className?: string
}

export function Container({ as: Tag = 'div', children, className = '' }: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8 ${className}`.trim()}>
      {children}
    </Tag>
  )
}
