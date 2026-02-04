import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Calendar, Heart } from 'lucide-react'

export default function DayCounter() {
    const [days, setDays] = useState(0)
    const startDate = new Date('2024-09-18') // September 18, 2024

    useEffect(() => {
        const calculateDays = () => {
            const today = new Date()
            const diffTime = Math.abs(today - startDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setDays(diffDays)
        }
        calculateDays()
        const interval = setInterval(calculateDays, 1000 * 60 * 60) // Update every hour
        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-rose-600 flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Days Together
                    </CardTitle>
                    <Heart className="h-8 w-8 fill-pink-500 text-pink-500 animate-heartbeat" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 blur-xl opacity-50 animate-pulse-glow"></div>
                        <div className="relative text-8xl font-black bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                            {days}
                        </div>
                    </div>
                    <p className="text-rose-500 font-semibold text-xl">magical days</p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-pink-200/50">
                    <div className="text-center p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl">
                        <div className="text-2xl font-bold text-rose-600">{Math.floor(days / 7)}</div>
                        <div className="text-xs text-rose-500 font-medium">weeks</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl">
                        <div className="text-2xl font-bold text-rose-600">{Math.floor(days / 30)}</div>
                        <div className="text-xs text-rose-500 font-medium">months</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                        <div className="text-2xl font-bold text-rose-600">{(days / 365).toFixed(1)}</div>
                        <div className="text-xs text-rose-500 font-medium">years</div>
                    </div>
                </div>

                <p className="text-center text-rose-400 text-sm italic flex items-center justify-center gap-2">
                    <span className="text-lg">💑</span>
                    Since October 18, 2024
                    <span className="text-lg">💕</span>
                </p>
            </CardContent>
        </Card>
    )
}
