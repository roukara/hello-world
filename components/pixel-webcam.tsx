"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Camera, Video, Download, Maximize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import CustomSlider from "./ui/custom-slider"
import CustomButton from "./ui/custom-button"
import CustomColorPicker from "./ui/custom-color-picker"

export default function PixelWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [pixelSize, setPixelSize] = useState(8)
  const [edgeThreshold, setEdgeThreshold] = useState(50)
  const [blurRadius, setBlurRadius] = useState(3)
  const lineWidth = 2
  const [lineColor, setLineColor] = useState("#00f")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const [status, setStatus] = useState<string>("")

  // Webcam toggle
  const toggleWebcam = async () => {
    if (isStreaming) {
      stopWebcam()
    } else {
      await startWebcam()
    }
  }

  // Start webcam
  const startWebcam = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Your browser doesn't support camera access.")
      return
    }

    setStatus("Requesting camera access...")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStatus("Camera stream acquired.")

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play()
            setIsStreaming(true)
            setStatus("")
          } catch (playErr) {
            console.error("Failed to start video playback:", playErr)
            setStatus(`Error: ${playErr}`)
            stopWebcam()
          }
        }
      }
    } catch (err) {
      console.error("Failed to access webcam:", err)
      setStatus(`Error: ${err}`)
    }
  }

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
      setStatus("")
    }
  }

  // Apply edge detection and draw
  const applyEdgeDetectionAndDraw = useCallback(() => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    if (video.readyState < 2) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Convert to grayscale and apply blur
    const grayData = new Uint8ClampedArray(data.length / 4)
    for (let i = 0; i < data.length; i += 4) {
      grayData[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3
    }

    // Gaussian blur
    const blurredData = gaussianBlur(grayData, canvas.width, canvas.height, blurRadius)

    // Sobel edge detection
    const edges = sobelEdgeDetection(blurredData, canvas.width, canvas.height, edgeThreshold)

    // Draw edges
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth

    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        if (edges[y * canvas.width + x]) {
          ctx.strokeRect(x, y, pixelSize, pixelSize)
        }
      }
    }
  }, [isStreaming, pixelSize, edgeThreshold, blurRadius, lineColor])

  // Gaussian blur
  const gaussianBlur = (data: Uint8ClampedArray, width: number, height: number, radius: number) => {
    const kernel = generateGaussianKernel(radius)
    const result = new Uint8ClampedArray(data.length)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx))
            const py = Math.min(height - 1, Math.max(0, y + ky))
            sum += data[py * width + px] * kernel[(ky + radius) * (radius * 2 + 1) + (kx + radius)]
          }
        }
        result[y * width + x] = sum
      }
    }

    return result
  }

  // Generate Gaussian kernel
  const generateGaussianKernel = (radius: number) => {
    const kernel = new Float32Array((radius * 2 + 1) ** 2)
    let sum = 0
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const value = Math.exp(-(x * x + y * y) / (2 * radius * radius))
        kernel[(y + radius) * (radius * 2 + 1) + (x + radius)] = value
        sum += value
      }
    }
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= sum
    }
    return kernel
  }

  // Sobel edge detection
  const sobelEdgeDetection = (data: Uint8ClampedArray, width: number, height: number, threshold: number) => {
    const edges = new Uint8ClampedArray(data.length)
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sumX = 0
        let sumY = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx)
            sumX += data[idx] * sobelX[(ky + 1) * 3 + (kx + 1)]
            sumY += data[idx] * sobelY[(ky + 1) * 3 + (kx + 1)]
          }
        }
        const magnitude = Math.sqrt(sumX * sumX + sumY * sumY)
        edges[y * width + x] = magnitude > threshold ? 255 : 0
      }
    }

    return edges
  }

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      applyEdgeDetectionAndDraw()
      animationFrameId = requestAnimationFrame(animate)
    }

    if (isStreaming) {
      animate()
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isStreaming, applyEdgeDetectionAndDraw])

  const captureImage = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png")
      setCapturedImage(dataURL)
    }
  }

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement("a")
      link.href = capturedImage
      link.download = "edge-detection-webcam.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearCapturedImage = () => {
    setCapturedImage(null)
    setIsImageExpanded(false)
  }

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-6 w-full max-w-3xl bg-gray-50 p-8 rounded-3xl shadow-lg"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full aspect-video bg-white rounded-2xl overflow-hidden shadow-inner"
      >
        <video ref={videoRef} className="hidden" playsInline muted onError={(e) => console.error("Video error:", e)} />
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
        {!isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl font-semibold cursor-pointer"
            onClick={toggleWebcam}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && toggleWebcam()}
          >
            Turn on camera
          </motion.div>
        )}
        <AnimatePresence>
          {capturedImage && !isImageExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
              onClick={toggleImageExpand}
            >
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured thumbnail"
                className="w-full h-full object-cover"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
              >
                <Maximize2 className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <CustomButton
            onClick={toggleWebcam}
            icon={<Video className="text-white" />}
            label={isStreaming ? "Stop camera" : "Start camera"}
            color={isStreaming ? "red" : "green"}
          />
          <CustomButton
            onClick={captureImage}
            icon={<Camera className="text-white" />}
            label="Capture image"
            color="blue"
          />
        </div>

        <div className="space-y-4 select-none">
          <CustomSlider min={1} max={20} value={pixelSize} onChange={setPixelSize} label="Pixel Size" />
          <CustomSlider
            min={10}
            max={200}
            value={edgeThreshold}
            onChange={setEdgeThreshold}
            label="Edge Detection Sensitivity"
          />
          <CustomSlider min={0} max={5} value={blurRadius} onChange={setBlurRadius} label="Blur Intensity" />
          <CustomColorPicker value={lineColor} onChange={setLineColor} label="Line Color" />
        </div>
      </div>

      <AnimatePresence>
        {isImageExpanded && capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={toggleImageExpand}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={capturedImage || "/placeholder.svg"} alt="Captured image" className="w-full h-auto" />
              <div className="mt-4 flex justify-end">
                <CustomButton
                  onClick={downloadImage}
                  icon={<Download className="text-white" />}
                  label="Download"
                  color="blue"
                  showLabel
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-xl text-yellow-800"
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

