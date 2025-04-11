"use client"

import React from "react"
import { motion } from "framer-motion"

interface CustomButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  color: "green" | "red" | "blue"
  showLabel?: boolean
}

const CustomButton: React.FC<CustomButtonProps> = ({ onClick, icon, label, color, showLabel = false }) => {
  const colorClasses = {
    green: "bg-green-500 hover:bg-green-600",
    red: "bg-red-500 hover:bg-red-600",
    blue: "bg-blue-500 hover:bg-blue-600",
  }

  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center justify-center ${showLabel ? "px-4 py-2" : "w-12 h-12"} rounded-full transition-colors ${colorClasses[color]}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 text-white" })}
      {showLabel && <span className="ml-2 text-white">{label}</span>}
    </motion.button>
  )
}

export default CustomButton

