import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/utils/cn'

type GlassPanelProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    subtle?: boolean
  }
>

export const GlassPanel = ({
  children,
  className,
  subtle = false,
  ...props
}: GlassPanelProps) => (
  <div
    className={cn(
      'rounded-[1.75rem] border border-white/10 shadow-[0_24px_60px_rgba(2,6,23,0.34)] backdrop-blur-2xl',
      subtle ? 'bg-white/[0.04]' : 'bg-white/[0.06]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
