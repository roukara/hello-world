"use client"

import React, { useCallback, useRef, useState } from "react"

interface CustomSliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  label: string
}

const CustomSlider: React.FC<CustomSliderProps> = ({ min, max, value, onChange, label }) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true)
    handleMouseMove(event)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if ((isDragging || event.type === "mousedown") && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
        const percentage = x / rect.width
        const newValue = Math.round(min + percentage * (max - min))
        onChange(newValue)
      }
    },
    [isDragging, min, max, onChange],
  )

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove as (event: MouseEvent) => void)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove as (event: MouseEvent) => void)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 select-none">{label}</label>
        <span className="text-sm font-medium text-gray-500 select-none">{value}</span>
      </div>
      <div
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -mt-1 -ml-2"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default CustomSlider

