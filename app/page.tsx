import PixelWebcam from "@/components/pixel-webcam"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-3xl font-bold mb-6">Hello, World?</h1>
      <PixelWebcam />
    </main>
  )
}

