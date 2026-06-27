import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type RangeInputProps = InputHTMLAttributes<HTMLInputElement> & {
  accent?: 'primary' | 'subtle'
}

export const RangeInput = ({
  className,
  accent = 'primary',
  ...props
}: RangeInputProps) => (
  <input
    type="range"
    className={cn(
      'h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10',
      '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10',
      '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/30 [&::-webkit-slider-thumb]:bg-white',
      accent === 'primary' && '[&::-webkit-slider-thumb]:shadow-[0_0_16px_rgba(124,161,255,0.75)]',
      accent === 'subtle' && '[&::-webkit-slider-thumb]:bg-white/80',
      className,
    )}
    {...props}
  />
)
