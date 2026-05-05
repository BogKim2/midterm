import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

export function PageWrapper({ children }: PropsWithChildren) {
  return (
    <motion.main
      className="page-wrapper"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.main>
  )
}
