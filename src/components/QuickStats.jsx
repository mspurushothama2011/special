import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export default function QuickStats() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalPhotos: 0,
        upcomingEvents: [],
        monthlyExpenses: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch total photos
            const { count: photoCount } = await supabase
                .from('photos')
                .select('*', { count: 'exact', head: true })

            // Fetch upcoming events (next 3)
            const today = new Date().toISOString()
            const { data: events } = await supabase
                .from('events')
                .select('id, title, date, type')
                .gte('date', today)
                .order('date', { ascending: true })
                .limit(3)

            // Fetch this month's expenses
            const now = new Date()
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

            const { data: expenses } = await supabase
                .from('expenses')
                .select('amount')
                .gte('date', firstDay)
                .lte('date', lastDay)

            const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) || 0

            setStats({
                totalPhotos: photoCount || 0,
                upcomingEvents: events || [],
                monthlyExpenses: totalExpenses
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const getEventIcon = (type) => {
        switch (type) {
            case 'anniversary': return '💑'
            case 'date': return '💕'
            case 'birthday': return '🎂'
            case 'special': return '✨'
            case 'trip': return '✈️'
            case 'reminder': return '⏰'
            default: return '📌'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Quick Stats 📊
                </h2>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-400">
                    <div className="animate-pulse">Loading stats...</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Total Photos */}
                    <div
                        onClick={() => navigate('/gallery')}
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all hover:shadow-md active:scale-98 group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Camera className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Photos</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalPhotos}</p>
                                </div>
                            </div>
                            <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">📸</div>
                        </div>
                    </div>

                    {/* Monthly Expenses */}
                    <div
                        onClick={() => navigate('/spend')}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all hover:shadow-md active:scale-98 group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-green-600">₹{stats.monthlyExpenses.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">💰</div>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div
                        onClick={() => navigate('/calendar')}
                        className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-200 hover:border-pink-400 cursor-pointer transition-all hover:shadow-md active:scale-98"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Upcoming Events</p>
                                <p className="text-lg font-bold text-pink-600">{stats.upcomingEvents.length} Soon</p>
                            </div>
                        </div>

                        {stats.upcomingEvents.length > 0 ? (
                            <div className="space-y-2 ml-13">
                                {stats.upcomingEvents.map(event => (
                                    <div key={event.id} className="flex items-center gap-2 text-sm">
                                        <span className="text-lg">{getEventIcon(event.type)}</span>
                                        <span className="font-medium text-gray-700 flex-1 truncate">{event.title}</span>
                                        <span className="text-xs text-gray-500">{format(new Date(event.date), 'MMM d')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-2">No upcoming events</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
