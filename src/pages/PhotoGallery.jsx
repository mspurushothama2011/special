import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Camera, X } from "lucide-react"

export default function PhotoGallery() {
    const [photos, setPhotos] = useState([])
    const [uploading, setUploading] = useState(false)
    const [caption, setCaption] = useState('')
    const [showCamera, setShowCamera] = useState(false)
    const [selectedPhoto, setSelectedPhoto] = useState(null) // For lightbox
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchPhotos()
    }, [])

    useEffect(() => {
        // Cleanup camera when component unmounts or camera is closed
        return () => {
            stopCamera()
        }
    }, [])

    const fetchPhotos = async () => {
        const { data } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setPhotos(data)
    }

    useEffect(() => {
        if (showCamera && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }, [showCamera])

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            })
            // Store stream first
            streamRef.current = stream
            // Then show camera - useEffect will handle attachment
            setShowCamera(true)
        } catch (err) {
            console.error('Error accessing camera:', err)
            alert('Could not access camera. Please grant permission.')
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setShowCamera(false)
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await uploadPhoto(blob, 'camera-photo.jpg')
                    stopCamera()
                }
            }, 'image/jpeg', 0.9)
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (file) {
            await uploadPhoto(file, file.name)
        }
    }

    const uploadPhoto = async (file, fileName) => {
        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Please log in to upload photos')
                setUploading(false)
                return
            }

            // Generate unique filename
            const fileExt = fileName.split('.').pop()
            const uniqueFileName = `${user.id}/${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('memories')
                .upload(uniqueFileName, file)

            if (uploadError) {
                console.error('Upload error:', uploadError)
                alert('Failed to upload photo: ' + uploadError.message)
                setUploading(false)
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(uniqueFileName)

            // Save metadata to database
            const { error: dbError } = await supabase.from('photos').insert({
                url: publicUrl,
                storage_path: uniqueFileName,
                caption: caption || null,
                uploaded_by: user.id
            })

            if (dbError) {
                console.error('Database error:', dbError)
                alert('Failed to save photo metadata')
            } else {
                setCaption('')
                fetchPhotos()
            }
        } catch (err) {
            console.error('Error:', err)
            alert('An error occurred while uploading')
        }

        setUploading(false)
    }

    const handleDelete = async (photo, e) => {
        e?.stopPropagation() // Prevent triggering image click
        const confirmDelete = window.confirm('Delete this photo?')
        if (!confirmDelete) return

        try {
            // Delete from storage
            if (photo.storage_path) {
                const { error: storageError } = await supabase.storage
                    .from('memories')
                    .remove([photo.storage_path])

                if (storageError) {
                    console.error('Storage delete error:', storageError)
                }
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('photos')
                .delete()
                .eq('id', photo.id)

            if (dbError) {
                console.error('Database delete error:', dbError)
                alert('Failed to delete photo')
                return
            }

            // Update local state
            setPhotos(photos.filter(p => p.id !== photo.id))
            setSelectedPhoto(null)
        } catch (err) {
            console.error('Delete error:', err)
            alert('An error occurred while deleting')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-pink-200">
                    <div>
                        <h1 className="text-3xl font-bold text-rose-600 flex items-center gap-2">📸 Our Memories 💝</h1>
                        <p className="text-rose-500 flex items-center gap-1">🌸 Capture and cherish memories together ✨</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={startCamera} variant="secondary">
                            <Camera className="mr-2 h-4 w-4" /> Take Photo
                        </Button>
                        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>
                </header>

                {/* Camera Modal */}
                {showCamera && (
                    <Card className="animate-in slide-in-from-top-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Take a Photo</CardTitle>
                            <Button variant="ghost" size="icon" onClick={stopCamera}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative bg-black rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full max-h-96 object-contain"
                                />
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                            <Input
                                placeholder="Add a caption (optional)"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                            <Button onClick={capturePhoto} className="w-full" disabled={uploading}>
                                <Camera className="mr-2 h-4 w-4" /> {uploading ? 'Saving...' : 'Capture Photo'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Caption Input for Upload */}
                {!showCamera && (
                    <Card>
                        <CardContent className="pt-6">
                            <Input
                                placeholder="Add a caption for your next upload (optional)"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                )}


                {/* Photo Grid */}
                <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                    {photos.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No photos yet. Start capturing memories!
                            </CardContent>
                        </Card>
                    ) : (
                        photos.map((photo) => (
                            <Card
                                key={photo.id}
                                className="break-inside-avoid group relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.caption || 'Memory'}
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                />
                                {photo.caption && (
                                    <div className="p-3 bg-white/95 backdrop-blur-sm border-t border-pink-100">
                                        <p className="text-sm font-medium text-slate-800">{photo.caption}</p>
                                    </div>
                                )}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => handleDelete(photo, e)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))
                    )}
                </div>

                {/* Lightbox Modal */}
                {selectedPhoto && (
                    <div
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 text-white hover:bg-white/20"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="destructive"
                                className="absolute bottom-4 right-4"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(selectedPhoto)
                                }}
                            >
                                <X className="h-4 w-4 mr-2" /> Delete Photo
                            </Button>
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.caption || 'Memory'}
                                className="max-w-full max-h-full object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {selectedPhoto.caption && (
                                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg max-w-md">
                                    <p>{selectedPhoto.caption}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
