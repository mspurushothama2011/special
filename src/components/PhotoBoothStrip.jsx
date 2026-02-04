import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Upload, Download, X, ImageIcon } from 'lucide-react'
import './PhotoBoothStrip.css'

const LAYOUTS = [
    { id: 'vertical', name: 'Classic Vertical', minPhotos: 2, maxPhotos: 6 },
    { id: 'horizontal', name: 'Classic Horizontal', minPhotos: 2, maxPhotos: 6 },
    { id: 'grid-2x2', name: 'Grid 2×2', minPhotos: 4, maxPhotos: 4 },
    { id: 'grid-2x3', name: 'Grid 2×3', minPhotos: 6, maxPhotos: 6 },
    { id: 'polaroid', name: 'Polaroid Collage', minPhotos: 2, maxPhotos: 6 },
    { id: 'filmstrip', name: 'Film Strip', minPhotos: 3, maxPhotos: 6 },
    { id: 'scattered', name: 'Scattered Polaroids', minPhotos: 3, maxPhotos: 6 },
    { id: 'diagonal', name: 'Diagonal', minPhotos: 2, maxPhotos: 5 },
    { id: 'circular', name: 'Circular', minPhotos: 4, maxPhotos: 6 },
    { id: 'story', name: 'Instagram Story', minPhotos: 1, maxPhotos: 4 },
    { id: 'insta-post', name: 'Instagram Post', minPhotos: 1, maxPhotos: 4 }
]

const FILTERS = [
    { id: 'original', name: 'Original', css: '' },
    { id: 'bw', name: 'B&W', css: 'grayscale(100%)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(60%) saturate(80%)' },
    { id: 'warm', name: 'Warm', css: 'sepia(30%) saturate(150%) brightness(105%)' },
    { id: 'cool', name: 'Cool', css: 'hue-rotate(180deg) saturate(120%)' },
    { id: 'noir', name: 'High Contrast', css: 'grayscale(100%) contrast(150%)' },
    { id: 'dreamy', name: 'Soft/Dreamy', css: 'brightness(110%) saturate(80%) blur(0.5px)' },
    { id: 'retro', name: 'Retro 80s', css: 'saturate(180%) contrast(120%) hue-rotate(-10deg)' }
]

// Preview image component to handle async generation
function PreviewImage({ generateFn }) {
    const [imageSrc, setImageSrc] = useState(null)

    useEffect(() => {
        let cancelled = false
        async function generate() {
            const src = await generateFn()
            if (!cancelled && src) {
                setImageSrc(src)
            }
        }
        generate()
        return () => { cancelled = true }
    }, [generateFn])

    if (!imageSrc) return <div className="text-center p-4">Generating preview...</div>
    return <img src={imageSrc} alt="Strip preview" className="strip-preview-img" />
}

export default function PhotoBoothStrip({ isOpen, onClose, onSave }) {
    const [step, setStep] = useState(1) // 1: setup, 2: capture, 3: preview
    const [photoCount, setPhotoCount] = useState(4)
    const [selectedLayout, setSelectedLayout] = useState('vertical')
    const [selectedFilter, setSelectedFilter] = useState('original')
    const [capturedPhotos, setCapturedPhotos] = useState([])
    const [countdown, setCountdown] = useState(null)
    const [currentCapture, setCurrentCapture] = useState(0)
    const [showCamera, setShowCamera] = useState(false)
    const [saving, setSaving] = useState(false)
    const [caption, setCaption] = useState('')

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const stripCanvasRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    // Auto-select valid layout when photo count changes
    useEffect(() => {
        const currentLayout = LAYOUTS.find(l => l.id === selectedLayout)
        if (currentLayout && (photoCount < currentLayout.minPhotos || photoCount > currentLayout.maxPhotos)) {
            // Current layout not valid, select first available
            const firstAvailable = LAYOUTS.find(
                l => photoCount >= l.minPhotos && photoCount <= l.maxPhotos
            )
            if (firstAvailable) {
                setSelectedLayout(firstAvailable.id)
            }
        }
    }, [photoCount, selectedLayout])

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 },
                audio: false
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setShowCamera(true)

                // Wait for camera to be ready
                return new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play()
                        resolve(true)
                    }
                })
            }
        } catch (err) {
            console.error('Camera error:', err)
            alert('Could not access camera. Please grant permission.')
            return false
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setShowCamera(false)
    }

    const startPhotoSequence = async () => {
        setCapturedPhotos([]) // Clear previous photos
        setStep(2)
        const cameraReady = await startCamera()

        if (cameraReady) {
            // Wait for camera to fully initialize
            setTimeout(() => {
                captureSequence(0)
            }, 1500)
        } else {
            setStep(1)
        }
    }

    const captureSequence = async (index) => {
        // Check if we've captured all photos
        if (index >= photoCount) {
            stopCamera()
            // Initialize caption when capture completes
            const layoutName = LAYOUTS.find(l => l.id === selectedLayout)?.name || 'Photo booth strip'
            setCaption(`Photo booth strip - ${layoutName}`)
            setStep(3)
            return
        }

        setCurrentCapture(index + 1)

        // Countdown from 3 to 1
        for (let i = 3; i >= 1; i--) {
            setCountdown(i)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Clear countdown and capture
        setCountdown(null)
        await new Promise(resolve => setTimeout(resolve, 100))

        // Capture the photo
        capturePhoto(index)

        // Wait before next photo
        await new Promise(resolve => setTimeout(resolve, 800))

        // Continue to next photo
        captureSequence(index + 1)
    }

    const capturePhoto = (index) => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const video = videoRef.current
            const canvas = canvasRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)

            const imageData = canvas.toDataURL('image/jpeg', 0.92)
            setCapturedPhotos(prev => {
                const newPhotos = [...prev]
                newPhotos[index] = imageData
                return newPhotos
            })
        } else {
            console.error('Video not ready for capture')
        }
    }

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || [])

        if (files.length !== photoCount) {
            alert(`Please select exactly ${photoCount} photo${photoCount > 1 ? 's' : ''}`)
            e.target.value = '' // Reset file input
            return
        }

        const readers = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target.result)
                reader.readAsDataURL(file)
            })
        })

        Promise.all(readers).then(images => {
            setCapturedPhotos(images)
            // Initialize caption when entering preview
            const layoutName = LAYOUTS.find(l => l.id === selectedLayout)?.name || 'Photo booth strip'
            setCaption(`Photo booth strip - ${layoutName}`)
            setStep(3)
        })
    }

    const generateStrip = async () => {
        const canvas = stripCanvasRef.current
        if (!canvas || capturedPhotos.length === 0) return null

        const ctx = canvas.getContext('2d')
        const filter = FILTERS.find(f => f.id === selectedFilter)

        // Set canvas size based on layout
        let width, height

        switch (selectedLayout) {
            case 'vertical':
                // Tall narrow strip
                width = 600
                height = photoCount * 280 + (photoCount + 1) * 40
                break

            case 'horizontal':
                // Wide short strip
                width = 1200
                height = 400
                break

            case 'grid-2x2':
                // Square for 2x2 grid
                width = 1080
                height = 1080
                break

            case 'grid-2x3':
                // Portrait rectangle for 2x3 grid
                width = 1080
                height = 1620
                break

            case 'polaroid':
            case 'scattered':
                // Square-ish for scattered polaroids
                width = 1080
                height = 1080
                break

            case 'filmstrip':
                // Wide cinema format
                width = 1400
                height = 500
                break

            case 'diagonal':
                // Square for diagonal arrangement
                width = 1080
                height = 1080
                break

            case 'circular':
                // Square for circular arrangement
                width = 1080
                height = 1080
                break

            case 'story':
                // Tall Instagram story format (9:16)
                width = 1080
                height = 1920
                break

            case 'insta-post':
                // Square Instagram post (1:1)
                width = 1080
                height = 1080
                break

            default:
                width = 1080
                height = 1512
        }

        canvas.width = width
        canvas.height = height

        // Background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        // Preload all images before drawing
        const loadedImages = await Promise.all(
            capturedPhotos.map(photo => {
                return new Promise((resolve, reject) => {
                    const img = new Image()
                    img.onload = () => resolve(img)
                    img.onerror = reject
                    img.src = photo
                })
            })
        )

        // Apply filter
        if (filter && filter.css) {
            ctx.filter = filter.css
        }

        // Draw photos based on layout with loaded images
        await drawLayout(ctx, width, height, loadedImages)

        ctx.filter = 'none'

        // Add vintage border
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 20
        ctx.strokeRect(10, 10, width - 20, height - 20)

        return canvas.toDataURL('image/png', 1.0)
    }

    const drawLayout = (ctx, width, height, loadedImages) => {
        const padding = 40

        switch (selectedLayout) {
            case 'vertical': {
                const photoHeight = (height - padding * (photoCount + 1)) / photoCount
                const photoWidth = width - padding * 2
                loadedImages.forEach((img, i) => {
                    const y = padding + i * (photoHeight + padding)
                    ctx.drawImage(img, padding, y, photoWidth, photoHeight)
                })
                break
            }

            case 'horizontal': {
                const photoWidth = (width - padding * (photoCount + 1)) / photoCount
                const photoHeight = height - padding * 2
                loadedImages.forEach((img, i) => {
                    const x = padding + i * (photoWidth + padding)
                    ctx.drawImage(img, x, padding, photoWidth, photoHeight)
                })
                break
            }

            case 'grid-2x2': {
                const photoSize = (width - padding * 3) / 2
                loadedImages.forEach((img, i) => {
                    const x = padding + (i % 2) * (photoSize + padding)
                    const y = padding + Math.floor(i / 2) * (photoSize + padding)
                    ctx.drawImage(img, x, y, photoSize, photoSize)
                })
                break
            }

            case 'grid-2x3': {
                const photoWidth = (width - padding * 3) / 2
                const photoHeight = (height - padding * 4) / 3
                loadedImages.forEach((img, i) => {
                    const x = padding + (i % 2) * (photoWidth + padding)
                    const y = padding + Math.floor(i / 2) * (photoHeight + padding)
                    ctx.drawImage(img, x, y, photoWidth, photoHeight)
                })
                break
            }

            case 'polaroid':
            case 'scattered': {
                const size = Math.min(width, height) * 0.28 // Reduced from 0.35 for better spacing
                const positions = calculateScatteredPositions(photoCount, width, height, size)
                loadedImages.forEach((img, i) => {
                    ctx.save()
                    ctx.translate(positions[i].x, positions[i].y)
                    ctx.rotate(positions[i].angle)
                    // Polaroid frame
                    ctx.fillStyle = '#fff'
                    ctx.fillRect(-size / 2 - 10, -size / 2 - 10, size + 20, size + 40)
                    ctx.drawImage(img, -size / 2, -size / 2, size, size)
                    ctx.restore()
                })
                break
            }

            case 'filmstrip': {
                const photoWidth = (width - padding * (photoCount + 1)) / photoCount
                const photoHeight = photoWidth * 1.2
                const startY = (height - photoHeight) / 2
                loadedImages.forEach((img, i) => {
                    const x = padding + i * (photoWidth + padding)
                    ctx.drawImage(img, x, startY, photoWidth, photoHeight)
                })
                break
            }

            case 'diagonal': {
                const size = Math.min(width, height) * 0.4
                const step = Math.min(width, height) * 0.15
                loadedImages.forEach((img, i) => {
                    const x = padding + i * step
                    const y = padding + i * step
                    ctx.drawImage(img, x, y, size, size)
                })
                break
            }

            case 'circular': {
                const centerX = width / 2
                const centerY = height / 2
                const radius = Math.min(width, height) * 0.3
                const size = Math.min(width, height) * 0.25
                loadedImages.forEach((img, i) => {
                    const angle = (i / photoCount) * Math.PI * 2 - Math.PI / 2
                    const x = centerX + Math.cos(angle) * radius - size / 2
                    const y = centerY + Math.sin(angle) * radius - size / 2
                    ctx.drawImage(img, x, y, size, size)
                })
                break
            }

            case 'story': {
                const photoHeight = (height - padding * (photoCount + 1)) / photoCount
                const photoWidth = photoHeight * 0.75
                const startX = (width - photoWidth) / 2
                loadedImages.forEach((img, i) => {
                    const y = padding + i * (photoHeight + padding)
                    ctx.drawImage(img, startX, y, photoWidth, photoHeight)
                })
                break
            }

            case 'insta-post': {
                // Instagram post - centered grid or single photo
                if (photoCount === 1) {
                    // Single large photo centered
                    const size = Math.min(width, height) * 0.85
                    const x = (width - size) / 2
                    const y = (height - size) / 2
                    ctx.drawImage(loadedImages[0], x, y, size, size)
                } else {
                    // Grid layout for multiple photos
                    const cols = photoCount === 2 ? 2 : 2
                    const rows = Math.ceil(photoCount / 2)
                    const photoSize = (width - padding * (cols + 1)) / cols
                    loadedImages.forEach((img, i) => {
                        const col = i % cols
                        const row = Math.floor(i / cols)
                        const x = padding + col * (photoSize + padding)
                        const y = padding + row * (photoSize + padding)
                        ctx.drawImage(img, x, y, photoSize, photoSize)
                    })
                }
                break
            }

            default:
                break
        }
    }

    const calculateScatteredPositions = (count, width, height, size) => {
        const positions = []
        const angleRange = 15 // degrees
        const paddingFactor = 1.3 // Extra spacing multiplier

        // Calculate grid layout based on count
        let cols, rows
        if (count <= 2) {
            cols = 2
            rows = 1
        } else if (count <= 4) {
            cols = 2
            rows = 2
        } else {
            cols = 3
            rows = Math.ceil(count / 3)
        }

        // Calculate spacing
        const spacingX = (width - size * paddingFactor) / (cols + 1)
        const spacingY = (height - size * paddingFactor) / (rows + 1)

        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / cols)
            const col = i % cols

            // Position with proper spacing
            const baseX = spacingX * (col + 1) + (size * paddingFactor / 2) * col
            const baseY = spacingY * (row + 1) + (size * paddingFactor / 2) * row

            // Add slight random offset for scattered look
            const offsetX = (Math.random() - 0.5) * (spacingX * 0.3)
            const offsetY = (Math.random() - 0.5) * (spacingY * 0.3)

            const x = baseX + offsetX
            const y = baseY + offsetY
            const angle = (Math.random() - 0.5) * (angleRange * Math.PI / 180)

            positions.push({ x, y, angle })
        }

        return positions
    }

    const handleDownload = async () => {
        const dataUrl = await generateStrip()
        if (dataUrl) {
            const link = document.createElement('a')
            link.download = `photobooth-strip-${Date.now()}.png`
            link.href = dataUrl
            link.click()
        } else {
            alert('Failed to generate strip for download')
        }
    }

    const handleSaveToGallery = async () => {
        setSaving(true)
        try {
            const dataUrl = await generateStrip()
            if (!dataUrl) {
                alert('Failed to generate strip')
                setSaving(false)
                return
            }

            // Convert data URL to blob
            const response = await fetch(dataUrl)
            const blob = await response.blob()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Please log in to save to gallery')
                setSaving(false)
                return
            }

            // Upload to Supabase Storage
            const fileName = `${user.id}/photobooth-${Date.now()}.png`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('memories')
                .upload(fileName, blob, { contentType: 'image/png' })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                alert('Failed to upload: ' + uploadError.message)
                setSaving(false)
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(fileName)

            // Save to database with user's caption
            const { error: dbError } = await supabase.from('photos').insert({
                url: publicUrl,
                storage_path: fileName,
                caption: caption || `Photo booth strip - ${LAYOUTS.find(l => l.id === selectedLayout)?.name}`,
                uploaded_by: user.id
            })

            if (dbError) {
                console.error('Database error:', dbError)
                alert('Failed to save to gallery')
            } else {
                alert('✅ Saved to gallery!')
                if (onSave) onSave()
                handleClose()
            }
        } catch (err) {
            console.error('Error:', err)
            alert('An error occurred while saving')
        }
        setSaving(false)
    }

    const handleClose = () => {
        stopCamera()
        setStep(1)
        setCapturedPhotos([])
        setCountdown(null)
        setCurrentCapture(0)
        setPhotoCount(4)
        setSelectedLayout('vertical')
        setSelectedFilter('original')
        setCaption('')
        onClose()
    }

    const handleReset = () => {
        setCapturedPhotos([])
        setCountdown(null)
        setCurrentCapture(0)
        setCaption('')
        setStep(1)
    }

    const availableLayouts = LAYOUTS.filter(
        layout => photoCount >= layout.minPhotos && photoCount <= layout.maxPhotos
    )

    if (!isOpen) return null

    return (
        <div className="photobooth-overlay">
            <div className="photobooth-modal">
                <Card className="photobooth-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="photobooth-title">📸 Photo Booth Strip</CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Setup */}
                        {step === 1 && (
                            <div className="photobooth-setup">
                                <div className="setup-section">
                                    <label className="setup-label">Number of Photos (1-6):</label>
                                    <div className="photo-count-selector">
                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                            <button
                                                key={num}
                                                className={`count-btn ${photoCount === num ? 'active' : ''}`}
                                                onClick={() => setPhotoCount(num)}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="setup-section">
                                    <label className="setup-label">Layout Style:</label>
                                    <div className="layout-selector">
                                        {availableLayouts.map(layout => (
                                            <button
                                                key={layout.id}
                                                className={`layout-btn ${selectedLayout === layout.id ? 'active' : ''}`}
                                                onClick={() => setSelectedLayout(layout.id)}
                                            >
                                                {layout.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="setup-section">
                                    <label className="setup-label">Filter:</label>
                                    <div className="filter-selector">
                                        {FILTERS.map(filter => (
                                            <button
                                                key={filter.id}
                                                className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
                                                onClick={() => setSelectedFilter(filter.id)}
                                            >
                                                {filter.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <Button onClick={startPhotoSequence} className="w-full mb-2">
                                        <Camera className="mr-2 h-4 w-4" />
                                        Start Camera ({photoCount} photos)
                                    </Button>
                                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload {photoCount} Photo{photoCount > 1 ? 's' : ''}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Capture */}
                        {step === 2 && (
                            <div className="photobooth-capture">
                                <div className="capture-info">
                                    Photo {currentCapture} of {photoCount}
                                </div>
                                {countdown !== null && (
                                    <div className="countdown">{countdown}</div>
                                )}
                                <div className="camera-container">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="camera-preview"
                                    />
                                </div>
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="captured-preview">
                                    {capturedPhotos.map((photo, i) => (
                                        <img key={i} src={photo} alt={`Captured ${i + 1}`} className="mini-preview" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Preview */}
                        {step === 3 && capturedPhotos.length > 0 && (
                            <div className="photobooth-preview">
                                <h3 className="preview-title">Your Photo Strip!</h3>
                                <div className="strip-preview-container">
                                    <canvas ref={stripCanvasRef} className="strip-canvas" />
                                    <PreviewImage generateFn={generateStrip} />
                                </div>
                                <div className="setup-section" style={{ marginTop: '1rem' }}>
                                    <label className="setup-label">Caption:</label>
                                    <Input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Add a caption for your photo strip..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="preview-actions">
                                    <Button onClick={handleReset} variant="outline" className="mr-2">
                                        Start Over
                                    </Button>
                                    <Button onClick={handleDownload} variant="outline" className="mr-2">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                    <Button onClick={handleSaveToGallery} disabled={saving}>
                                        <ImageIcon className="mr-2 h-4 w-4" />
                                        {saving ? 'Saving...' : 'Save to Gallery'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
