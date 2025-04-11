"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface CustomColorPickerProps {
  value: string
  onChange: (value: string) => void
  label: string
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ value, onChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value
    }
  }, [value])

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="line-color" className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <motion.div
        className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <input
          ref={inputRef}
          type="color"
          id="line-color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
      </motion.div>
    </div>
  )
}

export default CustomColorPicker

