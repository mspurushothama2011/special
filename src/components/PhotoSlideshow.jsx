import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from './ui/card'

export default function PhotoSlideshow() {
    const [photos, setPhotos] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPhotos()
    }, [])

    useEffect(() => {
        if (photos.length === 0) return

        // Change photo every 4 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [photos.length])

    const fetchPhotos = async () => {
        const { data } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (data && data.length > 0) {
            // Shuffle photos for random order
            const shuffled = [...data].sort(() => Math.random() - 0.5)
            setPhotos(shuffled)
        }
        setIsLoading(false)
    }

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardContent className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading memories...</p>
                </CardContent>
            </Card>
        )
    }

    if (photos.length === 0) {
        return (
            <Card className="h-full">
                <CardContent className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">No photos yet. Add some memories!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-80 relative">
                {photos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                        style={{
                            opacity: index === currentIndex ? 1 : 0,
                            pointerEvents: index === currentIndex ? 'auto' : 'none'
                        }}
                    >
                        <img
                            src={photo.url}
                            alt={photo.caption || 'Memory'}
                            className="w-full h-full object-cover"
                        />
                        {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <p className="text-white text-sm">{photo.caption}</p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Indicator dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {photos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-white w-4'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to photo ${index + 1}`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
