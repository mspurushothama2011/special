import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DayCounter from "../components/DayCounter"
import ExpenseTracker from "../components/ExpenseTracker"
import PhotoSlideshow from "../components/PhotoSlideshow"
import FloatingHearts from "../components/FloatingHearts"
import LoveNotes from "../components/LoveNotes"
import QuickStats from "../components/QuickStats"
import { Heart, Sparkles } from "lucide-react"

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <div className="min-h-screen relative">
            <FloatingHearts />

            <div className="relative z-10 p-3 md:p-8 space-y-4 md:space-y-8">
                {/* Romantic Header - Mobile Optimized */}
                <header className="max-w-5xl mx-auto sticky top-2 md:top-4 z-20 animate-fadeIn">
                    <div className="glass-card rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl px-4 md:px-8 py-4 md:py-6 border-2 border-pink-300/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-heartbeat shadow-lg">
                                    <Heart className="text-white fill-white h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 md:gap-2">
                                        💕 Unified Hearts 💖
                                    </h1>
                                    <p className="text-sm md:text-base text-rose-600 font-medium flex items-center gap-1 md:gap-2 mt-1">
                                        <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                                        Welcome, {user?.email?.split('@')[0]}!
                                        <span className="text-base md:text-lg">🌸</span>
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="border-pink-300 hover:bg-pink-50 hover:border-pink-400 transition-all hover:shadow-md font-medium py-5 md:py-2 px-3 md:px-4"
                            >
                                <span className="hidden md:inline">Logout 👋</span>
                                <span className="md:hidden">👋</span>
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Grid - Mobile First */}
                <main className="max-w-5xl mx-auto space-y-4 md:space-y-6">
                    {/* Top Section - Day Counter & Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="relative animate-fadeIn">
                            <div className="absolute -top-3 -right-3 text-4xl animate-float">💝</div>
                            <div className="glass-card rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pink-300/50">
                                <DayCounter />
                            </div>
                        </div>

                        {/* Quick Stats Widget */}
                        <div className="relative animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                            <div className="absolute -top-3 -right-3 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>📊</div>
                            <div className="glass-card rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pink-300/50">
                                <QuickStats />
                            </div>
                        </div>
                    </div>

                    {/* Love Quotes Widget */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.15s' }}>
                        <div className="relative">
                            <div className="absolute -top-3 -left-3 text-3xl animate-float" style={{ animationDelay: '1s' }}>💌</div>
                            <div className="glass-card rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pink-300/50">
                                <LoveNotes />
                            </div>
                        </div>
                    </div>

                    {/* Expense Tracker */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="relative">
                            <div className="absolute -top-3 -left-3 text-3xl animate-float" style={{ animationDelay: '1.2s' }}>💰</div>
                            <div className="glass-card rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pink-300/50">
                                <ExpenseTracker />
                            </div>
                        </div>
                    </div>

                    {/* Photo Slideshow - Full width */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.25s' }}>
                        <div className="relative">
                            <div className="absolute -top-3 -right-3 text-4xl animate-float" style={{ animationDelay: '1.5s' }}>📸</div>
                            <div className="absolute -bottom-3 -left-3 text-3xl animate-float" style={{ animationDelay: '2s' }}>✨</div>
                            <div className="glass-card rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pink-300/50">
                                <PhotoSlideshow />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Decorative Footer Message */}
                <footer className="max-w-5xl mx-auto text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    <p className="text-rose-500 font-medium text-lg flex items-center justify-center gap-2">
                        <Heart className="h-5 w-5 fill-rose-500 animate-heartbeat" />
                        Made with love for you two
                        <Heart className="h-5 w-5 fill-rose-500 animate-heartbeat" style={{ animationDelay: '0.3s' }} />
                    </p>
                </footer>
            </div>
        </div>
    )
}
