import { useState, useEffect, useMemo, memo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Sparkles } from 'lucide-react'
import { moods, moodMessages } from '@/data/moodData'
import { supabase } from '@/lib/supabase'

// Memoized Confetti Component for performance
const Confetti = memo(() => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{
                        top: '-10%',
                        left: `${Math.random() * 100}%`,
                        opacity: 1
                    }}
                    animate={{
                        top: '110%',
                        opacity: 0,
                        rotate: Math.random() * 360
                    }}
                    transition={{
                        duration: Math.random() * 2 + 2,
                        ease: 'linear'
                    }}
                >
                    {['💕', '💖', '💗', '💝', '🌸', '✨'][Math.floor(Math.random() * 6)]}
                </motion.div>
            ))}
        </div>
    )
})

export default function MoodHub() {
    const [selectedMood, setSelectedMood] = useState(null)
    const [showSpecial, setShowSpecial] = useState(false)
    const [photos, setPhotos] = useState([])
    const [showConfetti, setShowConfetti] = useState(false)
    // Fetch dynamic mood messages
    const [moodMessages, setMoodMessages] = useState({})

    const { scrollYProgress } = useScroll()

    // Parallax effect for background hearts
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -150])

    // Check if today is anniversary (September 18)
    const today = new Date()
    const isAnniversary = today.getMonth() === 8 && today.getDate() === 18

    // Memoize expensive photo fetching - only fetch 12 photos for better performance
    useEffect(() => {
        fetchPhotos()
    }, [])

    useEffect(() => {
        const fetchMoodMessages = async () => {
            try {
                // First, try to fetch from external quote APIs
                const moodQuoteMap = {
                    happy: 'happiness',
                    love: 'love',
                    excited: 'inspirational',
                    grateful: 'friendship',
                    sad: 'wisdom',
                    stressed: 'wisdom',
                    special: 'love'
                }

                const fetchedMessages = {}

                // Attempt to fetch quotes for each mood from API
                for (const [moodKey, apiTag] of Object.entries(moodQuoteMap)) {
                    try {
                        const response = await fetch(`https://api.quotable.io/quotes/random?tags=${apiTag}&limit=5`)
                        if (response.ok) {
                            const quotes = await response.json()
                            fetchedMessages[moodKey] = quotes.map(q => {
                                const emoji = {
                                    happy: '😊',
                                    love: '💕',
                                    excited: '🎉',
                                    grateful: '🙏',
                                    sad: '💙',
                                    stressed: '💪',
                                    special: '💖'
                                }[moodKey]
                                return `${q.content} ${emoji}`
                            })
                        }
                    } catch (error) {
                        console.log(`Failed to fetch ${moodKey} quotes from API`)
                    }
                }

                // If we got some API quotes, use them
                if (Object.keys(fetchedMessages).length > 0) {
                    setMoodMessages(fetchedMessages)
                    return
                }

                // Fallback to database if API fails
                const { data, error } = await supabase
                    .from('mood_messages')
                    .select('mood, message')
                    .eq('is_active', true)

                if (!error && data && data.length > 0) {
                    // Group messages by mood
                    const grouped = {}
                    data?.forEach(item => {
                        if (!grouped[item.mood]) {
                            grouped[item.mood] = []
                        }
                        grouped[item.mood].push(item.message)
                    })
                    setMoodMessages(grouped)
                } else {
                    // Final fallback to static messages from moodData
                    const { moodMessages: staticMessages } = await import('@/data/moodData')
                    setMoodMessages(staticMessages)
                }
            } catch (error) {
                console.error('Error fetching mood messages:', error)
                // Ultimate fallback to inline static messages
                const { moodMessages: staticMessages } = await import('@/data/moodData')
                setMoodMessages(staticMessages)
            }
        }

        fetchMoodMessages()
    }, [])

    const fetchPhotos = async () => {
        const { data } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(12) // Limit to 12 for better performance

        if (data) setPhotos(data)
    }

    // Memoize the mood messages function
    const getRandomMessage = useMemo(() => (moodId) => {
        const messages = moodMessages[moodId] || moodMessages.happy || ["You're amazing! 💖"]
        return messages[Math.floor(Math.random() * messages.length)]
    }, [moodMessages])

    // Memoize the random photos function
    const getRandomPhotos = useMemo(() => (count = 4) => {
        if (!photos || photos.length === 0) return []
        const shuffled = [...photos].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, Math.min(count, photos.length))
    }, [photos])

    const handleMoodClick = (mood) => {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)

        setSelectedMood({
            ...mood,
            message: getRandomMessage(mood.id),
            photos: getRandomPhotos(4)
        })
    }

    const handleSpecialClick = () => {
        setShowSpecial(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)

        setSelectedMood({
            id: 'special',
            name: 'Anniversary Special',
            emoji: '💝',
            color: 'from-pink-500 to-rose-500',
            message: getRandomMessage('special'),
            photos: getRandomPhotos(4)
        })
    }

    // Confetti particles
    const Confetti = () => (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        y: -20,
                        x: Math.random() * window.innerWidth,
                        rotate: 0,
                        opacity: 1
                    }}
                    animate={{
                        y: window.innerHeight + 20,
                        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                        opacity: [1, 1, 0]
                    }}
                    transition={{
                        duration: Math.random() * 2 + 2,
                        ease: "linear",
                        delay: Math.random() * 0.5
                    }}
                    className="absolute"
                    style={{
                        fontSize: Math.random() * 20 + 15
                    }}
                >
                    {['💕', '💖', '💗', '💝', '💞', '✨', '🌟', '⭐'][Math.floor(Math.random() * 8)]}
                </motion.div>
            ))}
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4 md:p-8 relative overflow-hidden">
            {/* Animated Floating Hearts Background with Parallax */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.span
                    style={{ y: y1 }}
                    className="absolute top-20 left-10 text-3xl md:text-4xl animate-float opacity-30"
                >
                    💕
                </motion.span>
                <motion.span
                    style={{ y: y2 }}
                    className="absolute bottom-32 right-20 text-2xl md:text-3xl animate-float opacity-25"
                >
                    💖
                </motion.span>
                <motion.span
                    style={{ y: y3 }}
                    className="absolute top-1/2 right-1/4 text-3xl md:text-4xl animate-float opacity-30"
                >
                    ✨
                </motion.span>
                <motion.span
                    style={{ y: y1 }}
                    className="absolute bottom-1/4 left-1/4 text-2xl md:text-3xl animate-float opacity-25"
                >
                    💝
                </motion.span>
                <motion.span
                    style={{ y: y2 }}
                    className="absolute top-1/3 left-1/3 text-3xl md:text-4xl animate-float opacity-25"
                >
                    🌟
                </motion.span>
            </div>

            {/* Confetti Effect */}
            {showConfetti && <Confetti />}

            {/* Hidden Anniversary Button with Pulse */}
            {isAnniversary && !showSpecial && !selectedMood && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSpecialClick}
                    className="fixed bottom-20 md:bottom-8 right-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl z-50 animate-heartbeat"
                >
                    <Heart className="h-6 w-6" fill="white" />
                    <motion.div
                        className="absolute inset-0 rounded-full bg-pink-400"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity
                        }}
                    />
                </motion.button>
            )}

            <div className="max-w-6xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {!selectedMood ? (
                        // Mood Grid View
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Mobile-Optimized Header */}
                            <motion.header
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                                className="glass-card border-2 border-pink-300/50 p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-xl mb-4 md:mb-6 relative overflow-hidden"
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                    className="absolute -top-2 -right-2 md:top-0 md:right-0 text-4xl md:text-6xl opacity-15 md:opacity-20"
                                >
                                    💝
                                </motion.div>
                                <motion.h1
                                    className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent text-center mb-2"
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity
                                    }}
                                >
                                    💭 MoodHub 💕
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center text-rose-500 mt-2 font-medium flex items-center gap-2 justify-center"
                                >
                                    <Sparkles className="h-4 w-4 animate-pulse" />
                                    How are you feeling today?
                                    <Sparkles className="h-4 w-4 animate-pulse" />
                                </motion.p>
                            </motion.header>

                            {/* Mobile-First Mood Cards Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {moods.map((mood, index) => (
                                    <motion.div
                                        key={mood.id}
                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.4,
                                            type: "spring",
                                            bounce: 0.3
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            y: -5
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleMoodClick(mood)}
                                    >
                                        <Card className={`cursor-pointer active:scale-95 transition-all duration-200 ${mood.bgColor} border-2 ${mood.borderColor} shadow-lg active:shadow-xl p-4 md:p-8 text-center group relative overflow-hidden min-h-[140px] md:min-h-auto`}>
                                            {/* Shimmer Effect - Reduced on mobile */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 md:group-hover:opacity-30 hidden md:block"
                                                animate={{
                                                    x: ['-100%', '100%']
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    repeatDelay: 2
                                                }}
                                            />

                                            <motion.div className="text-6xl mb-4"
                                                whileHover={{
                                                    scale: 1.2,
                                                    rotate: [0, -10, 10, 0],
                                                    transition: { duration: 0.4 }
                                                }}
                                            >
                                                {mood.emoji}
                                            </motion.div>
                                            <h3 className="text-2xl font-bold text-gray-700 mb-2">
                                                {mood.name}
                                            </h3>
                                            <motion.div
                                                className={`h-1 w-16 mx-auto rounded-full bg-gradient-to-r ${mood.color}`}
                                                whileHover={{
                                                    width: "100%",
                                                    transition: { duration: 0.3 }
                                                }}
                                            />
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // Mobile-Optimized Letter View
                        <motion.div
                            key="letter"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-2xl mx-auto"
                        >
                            {/* Enhanced Back Button - Mobile Friendly */}
                            <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Button
                                    onClick={() => setSelectedMood(null)}
                                    variant="ghost"
                                    className="mb-3 md:mb-4 hover:bg-rose-100 group text-base md:text-sm py-5 md:py-2 px-4"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <ArrowLeft className="mr-2 h-5 w-5 md:h-4 md:w-4 group-hover:animate-pulse" />
                                    Back to Moods
                                </Button>
                            </motion.div>

                            {/* Letter Card - Mobile Optimized */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <Card className="glass-card border-2 border-pink-300/50 shadow-xl md:shadow-2xl overflow-hidden">
                                    {/* Animated Header - Reduced particles on mobile */}
                                    <motion.div
                                        className={`bg-gradient-to-r ${selectedMood.color} p-5 md:p-8 text-white text-center relative overflow-hidden`}
                                        animate={{
                                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity
                                        }}
                                    >
                                        {/* Floating Particles - Fewer on mobile */}
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute text-white opacity-15 md:opacity-20 text-sm md:text-base"
                                                initial={{
                                                    y: 100,
                                                    x: Math.random() * 100 + '%'
                                                }}
                                                animate={{
                                                    y: -20,
                                                }}
                                            >
                                                ✨
                                            </motion.div>
                                        ))}

                                        <motion.div
                                            className="text-5xl md:text-7xl mb-3 md:mb-4 relative z-10"
                                            animate={{
                                                scale: [1, 1.05, 1],
                                                rotate: [0, 3, -3, 0]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity
                                            }}
                                        >
                                            {selectedMood.emoji}
                                        </motion.div>
                                        <motion.h2
                                            className="text-xl md:text-3xl font-bold relative z-10"
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            {selectedMood.name}
                                        </motion.h2>
                                    </motion.div>

                                    {/* Message and Photos */}
                                    <div className="p-4 md:p-10 bg-gradient-to-br from-white to-pink-50">
                                        {/* Message Card - Mobile optimized */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-md md:shadow-lg border-2 border-pink-200 mb-4 md:mb-6 relative overflow-hidden"
                                        >
                                            {/* Ambient Glow */}
                                            <motion.div
                                                className={`absolute inset-0 bg-gradient-to-r ${selectedMood.color} opacity-5`}
                                                animate={{
                                                    opacity: [0.05, 0.08, 0.05]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity
                                                }}
                                            />
                                            <motion.p
                                                className="text-base md:text-xl text-gray-700 leading-relaxed text-center font-medium relative z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5, duration: 0.8 }}
                                            >
                                                "{selectedMood.message}"
                                            </motion.p>
                                        </motion.div>

                                        {/* Mobile-Optimized Image Grid */}
                                        <motion.div
                                            className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            {selectedMood.photos && selectedMood.photos.length > 0 ? (
                                                selectedMood.photos.map((photo, index) => (
                                                    <motion.div
                                                        key={photo.id || index}
                                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                        transition={{
                                                            delay: 0.8 + index * 0.1,
                                                            duration: 0.5,
                                                            type: "spring",
                                                            bounce: 0.4
                                                        }}
                                                        whileHover={{
                                                            scale: 1.05,
                                                            rotate: [0, 2, -2, 0],
                                                            zIndex: 10,
                                                            transition: { duration: 0.3 }
                                                        }}
                                                        className="aspect-square rounded-xl overflow-hidden border-2 border-pink-200 shadow-lg relative group"
                                                    >
                                                        <img
                                                            src={photo.url}
                                                            alt={photo.caption || 'Memory'}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                                                        />
                                                        {/* Overlay on Hover */}
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                            initial={{ opacity: 0 }}
                                                            whileHover={{ opacity: 1 }}
                                                        >
                                                            <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate">
                                                                {photo.caption || 'Beautiful Memory 💕'}
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                [0, 1, 2, 3].map((index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{
                                                            delay: 0.8 + index * 0.1,
                                                            type: "spring",
                                                            bounce: 0.4
                                                        }}
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        className={`aspect-square bg-gradient-to-br ${selectedMood.color} rounded-xl overflow-hidden border-2 border-pink-200 flex items-center justify-center shadow-lg relative group`}
                                                    >
                                                        <motion.span
                                                            className="text-5xl md:text-6xl opacity-80"
                                                            animate={{
                                                                scale: [1, 1.2, 1],
                                                                rotate: [0, 10, -10, 0]
                                                            }}
                                                            transition={{
                                                                duration: 3,
                                                                repeat: Infinity,
                                                                delay: index * 0.2
                                                            }}
                                                        >
                                                            {selectedMood.emoji}
                                                        </motion.span>
                                                    </motion.div>
                                                ))
                                            )}
                                        </motion.div>

                                        {/* Enhanced Button with Ripple Effect */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 1.2 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                onClick={() => handleMoodClick(moods.find(m => m.id === selectedMood.id) || selectedMood)}
                                                className={`w-full bg-gradient-to-r ${selectedMood.color} hover:opacity-90 text-white font-semibold py-6 rounded-xl shadow-lg relative overflow-hidden group`}
                                            >
                                                {/* Animated Background */}
                                                <motion.div
                                                    className="absolute inset-0 bg-white"
                                                    initial={{ x: '-100%' }}
                                                    whileHover={{ x: '100%' }}
                                                    transition={{ duration: 0.6 }}
                                                    style={{ opacity: 0.2 }}
                                                />
                                                <span className="relative z-10 flex items-center gap-2 justify-center">
                                                    <Sparkles className="h-5 w-5 animate-pulse" />
                                                    Get Another Message
                                                    <Sparkles className="h-5 w-5 animate-pulse" />
                                                </span>
                                            </Button>
                                        </motion.div>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
