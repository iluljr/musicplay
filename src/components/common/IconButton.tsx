import type { PropsWithChildren } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

type IconButtonProps = PropsWithChildren<
  HTMLMotionProps<'button'> & {
    active?: boolean
    size?: 'sm' | 'md' | 'lg'
  }
>

const sizeClasses = {
  sm: 'h-10 w-10 sm:h-11 sm:w-11',
  md: 'h-11 w-11 sm:h-12 sm:w-12',
  lg: 'h-12 w-12 sm:h-14 sm:w-14',
}

export const IconButton = ({
  active = false,
  children,
  className,
  size = 'md',
  ...props
}: IconButtonProps) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    whileHover={{ y: -2 }}
    className={cn(
      'flex items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/72 shadow-panel backdrop-blur-xl transition-colors duration-300 hover:bg-white/14 hover:text-white',
      active && 'border-accent-300/50 bg-accent-400/18 text-accent-100',
      sizeClasses[size],
      className,
    )}
    {...props}
  >
    {children}
  </motion.button>
)
