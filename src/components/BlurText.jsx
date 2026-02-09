import { motion } from 'motion/react'

/**
 * Blur-to-focus text animation. Text starts blurred and animates to sharp.
 * Compatible with the blur-text effect from shadcn/react-bits style.
 */
export function BlurText({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  blurMax = 8,
  ...props
}) {
  return (
    <motion.span
      className={className}
      initial={{
        filter: `blur(${blurMax}px)`,
        opacity: 0.4,
      }}
      animate={{
        filter: 'blur(0px)',
        opacity: 1,
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export default BlurText
