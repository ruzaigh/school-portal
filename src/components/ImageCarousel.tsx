import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import type { SchoolImage } from '../types/school'

interface ImageCarouselProps {
  images: SchoolImage[]
  isAdmin?: boolean
  onEditImages?: () => void
}

export default function ImageCarousel({ images, isAdmin = false, onEditImages }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length])

  const goToPrevious = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length)

  return (
    <div className="relative h-48 rounded-lg overflow-hidden bg-gray-200">
      <img src={images[currentIndex]?.url} alt={images[currentIndex]?.alt} className="w-full h-full object-cover transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {isAdmin && (
        <button onClick={onEditImages} className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white">
          <ImageIcon size={16} />
        </button>
      )}

      <button onClick={goToPrevious} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full">
        <ChevronLeft size={20} />
      </button>

      <button onClick={goToNext} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <div key={index} className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
        ))}
      </div>

      <div className="absolute bottom-4 left-4 text-white font-medium">{images[currentIndex]?.alt}</div>
    </div>
  )
}

