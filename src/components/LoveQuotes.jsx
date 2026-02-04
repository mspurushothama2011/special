import { useEffect, useState } from 'react'
import { Heart, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Fallback quotes if API fails
const fallbackQuotes = [
    "Every love story is beautiful, but ours is my favorite. 💕",
    "You are my today and all of my tomorrows. 🌹",
    "In you, I've found the love of my life and my closest friend. 💖",
    "Together is a wonderful place to be. ✨",
    "You make my heart smile. 😊",
    "Love is not about how many days, months, or years you've been together. It's all about how much you love each other every day. 💝",
    "I love you not only for what you are, but for what I am when I am with you. 🌸",
    "You are my sun, my moon, and all my stars. ⭐",
    "The best thing to hold onto in life is each other. 🤝",
    "My favorite place is inside your hug. 🫂",
    "With you, I am home. 🏡",
    "You're the peanut butter to my jelly. 🥜",
    "Every moment spent with you is my favorite moment. ⏰",
    "I choose you. And I'll choose you over and over again. 💍",
    "You are the reason I believe in love. 💗",
    "Distance means so little when someone means so much. 🌍",
    "You're my person. 👫",
    "Love you to the moon and back. 🌙",
    "You are my happy place. 😊",
    "Forever isn't long enough with you. ♾️"
]

// Add romantic emojis to quotes
const romanticEmojis = ['💕', '💖', '💗', '💝', '💞', '❤️', '🌹', '✨', '💑', '🌸']

export default function LoveQuotes() {
    const [currentQuote, setCurrentQuote] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [author, setAuthor] = useState('')

    const getRandomQuote = async () => {
        setIsRefreshing(true)

        try {
            // Try to fetch from API - using quotable.io for love/relationship quotes
            const response = await fetch('https://api.quotable.io/random?tags=love|friendship|famous-quotes&maxLength=150')

            if (response.ok) {
                const data = await response.json()
                const emoji = romanticEmojis[Math.floor(Math.random() * romanticEmojis.length)]
                setCurrentQuote(`${data.content} ${emoji}`)
                setAuthor(data.author)
            } else {
                // Fallback to static quotes
                useFallbackQuote()
            }
        } catch (error) {
            console.log('Using fallback quotes:', error)
            useFallbackQuote()
        } finally {
            setTimeout(() => setIsRefreshing(false), 500)
        }
    }

    const useFallbackQuote = () => {
        const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
        setCurrentQuote(fallbackQuotes[randomIndex])
        setAuthor('')
    }

    useEffect(() => {
        getRandomQuote()
    }, [])

    return (
        <div className="relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-heartbeat">
                        <Heart className="h-5 w-5 text-white fill-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Love Note 💌
                    </h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={getRandomQuote}
                    className="hover:bg-pink-50 active:scale-95 transition-transform"
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 text-rose-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="relative bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200 min-h-[120px] flex items-center justify-center">
                {/* Decorative hearts */}
                <div className="absolute top-2 left-2 text-pink-300 opacity-50 text-2xl">💕</div>
                <div className="absolute bottom-2 right-2 text-rose-300 opacity-50 text-2xl">💖</div>

                <div className={`text-center transition-opacity duration-300 ${isRefreshing ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-base md:text-lg text-gray-700 font-medium leading-relaxed">
                        "{currentQuote}"
                    </p>
                    {author && (
                        <p className="text-sm text-gray-500 mt-2 italic">— {author}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
