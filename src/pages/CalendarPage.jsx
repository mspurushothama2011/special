import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [newEvent, setNewEvent] = useState({ title: '', description: '', type: '', isYearly: false })
    const [viewingEvent, setViewingEvent] = useState(null)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('events')
            .select(`
    *,
    profiles: created_by(
        username,
        email
    )
            `)
            .order('date', { ascending: true })

        if (error) {
            console.error('Error fetching events:', error)
        } else if (data) {
            console.log('Fetched events:', data)
            setEvents(data)
        }
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getEventsForDay = (day) => {
        return events.filter(event => {
            const eventDate = new Date(event.date)

            // Check if it's a yearly event
            if (event.is_yearly) {
                // Match month and day, ignore year
                return eventDate.getMonth() === day.getMonth() &&
                    eventDate.getDate() === day.getDate()
            } else {
                // Regular event - exact date match
                return isSameDay(eventDate, day)
            }
        })
    }

    const handleAddEvent = async (e) => {
        e.preventDefault()
        if (!selectedDate) return

        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase.from('events').insert({
            title: newEvent.title,
            description: newEvent.description || null,
            type: newEvent.type || 'other',
            date: selectedDate.toISOString(),
            is_yearly: newEvent.isYearly,
            created_by: user?.id
        })

        if (!error) {
            setNewEvent({ title: '', description: '', type: '', isYearly: false })
            setShowForm(false)
            fetchEvents()
        } else {
            console.error('Error saving event:', error)
            alert('Failed to save event: ' + error.message)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-3 md:p-8 relative overflow-hidden">
            {/* Floating Love Decorations - Reduced on mobile */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <span className="absolute top-10 left-5 md:left-10 text-2xl md:text-4xl animate-float opacity-40 md:opacity-60">💕</span>
                <span className="absolute top-20 right-5 md:right-20 text-xl md:text-3xl animate-float opacity-30 md:opacity-50">💗</span>
                <span className="absolute bottom-32 left-1/4 text-3xl md:text-5xl animate-float opacity-25 md:opacity-40">💖</span>
            </div>

            <div className="max-w-4xl mx-auto space-y-3 md:space-y-6 relative z-10">
                {/* Compact Header - Mobile First */}
                <header className="glass-card border-2 border-pink-300/50 p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-4xl md:text-6xl opacity-10 md:opacity-20 transform rotate-12">💖</div>
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3 justify-center">
                        📅 Our Calendar 💕
                    </h1>
                    <p className="text-center text-rose-500 mt-1 md:mt-2 text-sm md:text-base font-medium flex items-center gap-1 md:gap-2 justify-center">
                        <span className="animate-heartbeat">💝</span>
                        Cherish every moment
                        <span className="animate-heartbeat">💝</span>
                    </p>
                </header>

                {/* Compact Calendar - Mobile Optimized */}
                <Card className="glass-card border-2 border-pink-300/50 shadow-lg md:shadow-xl">
                    <CardContent className="p-3 md:p-6">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <Button
                                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-pink-100 active:scale-95 p-2"
                            >
                                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-rose-600" />
                            </Button>
                            <h2 className="text-lg md:text-2xl font-bold text-rose-600">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                            <Button
                                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-pink-100 active:scale-95 p-2"
                            >
                                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-rose-600" />
                            </Button>
                        </div>

                        {/* Calendar Grid - Compact */}
                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {/* Day headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs md:text-sm font-semibold text-rose-500 pb-1 md:pb-2">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {days.map(day => {
                                const dayEvents = getEventsForDay(day)
                                const isSelected = selectedDate && isSameDay(day, selectedDate)
                                const isToday = isSameDay(day, new Date())

                                return (
                                    <button
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                            aspect-square rounded-lg md:rounded-xl p-1 md:p-2 text-xs md:text-base font-medium
                                            transition-all duration-200 relative
                                            ${isSelected ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg scale-105' : ''}
                                            ${!isSelected && isToday ? 'bg-pink-100 border-2 border-pink-400 text-rose-700' : ''}
                                            ${!isSelected && !isToday ? 'hover:bg-pink-50 text-gray-700 active:scale-95' : ''}
                                        `}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            {format(day, 'd')}
                                            {/* Event indicators */}
                                            {dayEvents.length > 0 && (
                                                <div className="flex gap-0.5 mt-0.5 md:mt-1">
                                                    {dayEvents.slice(0, 3).map((_, i) => (
                                                        <div key={i} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-500'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Date Events - Mobile First */}
                {selectedDate && (
                    <Card className="glass-card border-2 border-pink-300/50 shadow-lg md:shadow-xl">
                        <CardHeader className="pb-3 px-4 md:px-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg md:text-2xl font-bold text-rose-600 flex items-center gap-2">
                                    📌 {format(selectedDate, 'MMMM d, yyyy')}
                                </CardTitle>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    size="sm"
                                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md py-5 md:py-2 px-3 active:scale-95"
                                >
                                    <Plus className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Add Event</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 md:space-y-3 px-4 md:px-6 pb-4">
                            {getEventsForDay(selectedDate).length === 0 ? (
                                <div className="text-center py-6 md:py-8 text-gray-400">
                                    <div className="text-4xl md:text-5xl mb-2 md:mb-3">📝</div>
                                    <p className="text-sm md:text-base">No events this day</p>
                                    <p className="text-xs md:text-sm mt-1">Click "Add Event" to create one</p>
                                </div>
                            ) : (
                                getEventsForDay(selectedDate).map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => setViewingEvent(event)}
                                        className="bg-white p-3 md:p-4 rounded-xl border-2 border-pink-200 hover:border-pink-400 cursor-pointer transition-all hover:shadow-md active:scale-98 group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-base md:text-lg text-gray-800 group-hover:text-rose-600 transition-colors flex items-center gap-2">
                                                    {event.type === 'anniversary' && '💑'}
                                                    {event.type === 'date' && '💕'}
                                                    {event.type === 'birthday' && '🎂'}
                                                    {event.type === 'special' && '✨'}
                                                    {event.type === 'other' && '📌'}
                                                    {event.title}
                                                    {event.is_yearly && <span className="text-xs text-rose-500" title="Repeats yearly">🔁</span>}
                                                </h3>
                                                {event.description && (
                                                    <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-rose-400 mt-1 md:mt-2 flex items-center gap-1">
                                                    <span>👤</span>
                                                    {event.profiles?.username || event.profiles?.email?.split('@')[0] || 'Unknown'}
                                                </p>
                                            </div>
                                            <div className="text-2xl md:text-3xl opacity-70 group-hover:opacity-100 transition-opacity">
                                                💝
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Event Details Modal */}
                <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
                    <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300">
                        <DialogHeader>
                            <DialogTitle className="text-2xl md:text-3xl font-bold text-rose-600 flex items-center gap-2">
                                {viewingEvent?.type === 'anniversary' && '💑'}
                                {viewingEvent?.type === 'date' && '💕'}
                                {viewingEvent?.type === 'birthday' && '🎂'}
                                {viewingEvent?.type === 'special' && '✨'}
                                {viewingEvent?.type === 'other' && '📌'}
                                {viewingEvent?.title}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border-2 border-pink-200">
                                <p className="text-sm text-gray-500 mb-1">📅 Date</p>
                                <p className="text-base font-medium text-gray-800">
                                    {viewingEvent && format(new Date(viewingEvent.date), 'MMMM d, yyyy')}
                                </p>
                            </div>
                            {viewingEvent?.description && (
                                <div className="bg-white p-4 rounded-xl border-2 border-pink-200">
                                    <p className="text-sm text-gray-500 mb-1">📝 Description</p>
                                    <p className="text-base text-gray-800">{viewingEvent.description}</p>
                                </div>
                            )}
                            <div className="bg-white p-4 rounded-xl border-2 border-pink-200">
                                <p className="text-sm text-gray-500 mb-1">👤 Created by</p>
                                <p className="text-base font-medium text-rose-600">
                                    {viewingEvent?.profiles?.username || viewingEvent?.profiles?.email?.split('@')[0] || 'Unknown'}
                                </p>
                            </div>
                            <Button
                                onClick={() => setViewingEvent(null)}
                                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-6 md:py-3"
                            >
                                Close 💝
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add Event Modal */}
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300">
                        <DialogHeader>
                            <DialogTitle className="text-2xl md:text-3xl font-bold text-rose-600">
                                ✨ Add New Event
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                                <Input
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Enter event title"
                                    required
                                    className="border-2 border-pink-200 focus:border-pink-400 py-5 md:py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                                <Input
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Add details..."
                                    className="border-2 border-pink-200 focus:border-pink-400 py-5 md:py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                                <select
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                    className="w-full border-2 border-pink-200 focus:border-pink-400 rounded-md p-2 md:p-2.5 py-5 md:py-2"
                                    required
                                >
                                    <option value="">Select type...</option>
                                    <option value="anniversary">💑 Anniversary</option>
                                    <option value="date">💕 Date</option>
                                    <option value="birthday">🎂 Birthday</option>
                                    <option value="special">✨ Special</option>
                                    <option value="other">📌 Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.isYearly}
                                        onChange={(e) => setNewEvent({ ...newEvent, isYearly: e.target.checked })}
                                        className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500"
                                    />
                                    <span>🔁 Repeat every year</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-6">Event will appear on this date every year</p>
                            </div>
                            <div className="flex gap-2 md:gap-3 pt-2">
                                <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-6 md:py-3">
                                    Save Event 💝
                                </Button>
                                <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="flex-1 border-2 border-pink-300 hover:bg-pink-50 py-6 md:py-3">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Event Details - Modal Popup */}
                <Dialog open={!!viewingEvent} onOpenChange={(open) => !open && setViewingEvent(null)}>
                    <DialogContent className="glass-card border-2 border-pink-300/50 max-w-[95vw] sm:max-w-md overflow-hidden">
                        {viewingEvent && (
                            <>
                                {/* Romantic Header */}
                                <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 -m-6 mb-0 p-4 sm:p-8 relative overflow-hidden">
                                    {/* Decorative Hearts */}
                                    <span className="absolute top-2 right-2 text-3xl opacity-30 animate-pulse">💕</span>
                                    <span className="absolute bottom-2 left-2 text-2xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}>💖</span>

                                    <DialogHeader>
                                        <DialogTitle className="text-white text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 justify-center relative z-10">
                                            <span className="text-3xl sm:text-4xl">
                                                {viewingEvent.type === 'date' && '💑'}
                                                {viewingEvent.type === 'anniversary' && '💖'}
                                                {viewingEvent.type === 'birthday' && '🎂'}
                                                {viewingEvent.type === 'trip' && '✈️'}
                                                {viewingEvent.type === 'reminder' && '⏰'}
                                                {(!viewingEvent.type || viewingEvent.type === 'other') && '📌'}
                                            </span>
                                            <span className="break-words">{viewingEvent.title}</span>
                                        </DialogTitle>
                                    </DialogHeader>
                                </div>

                                {/* Event Details */}
                                <div className="space-y-4 p-4 sm:p-6">
                                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-200">
                                        <p className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-2">
                                            📅 Date & Time
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800">
                                            {format(new Date(viewingEvent.date), 'PPpp')}
                                        </p>
                                    </div>

                                    {viewingEvent.description && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                                            <p className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-2">
                                                📝 Description
                                            </p>
                                            <p className="text-gray-800">{viewingEvent.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {viewingEvent.type && (
                                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                                                <p className="text-xs font-bold text-rose-600 mb-1">🏷️ Type</p>
                                                <p className="capitalize font-semibold text-gray-800">{viewingEvent.type}</p>
                                            </div>
                                        )}
                                        {viewingEvent.profiles && (
                                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
                                                <p className="text-xs font-bold text-rose-600 mb-1">👤 Added by</p>
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {viewingEvent.profiles.username || viewingEvent.profiles.email || 'Unknown'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="destructive"
                                        className="w-full mt-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        onClick={async () => {
                                            if (confirm('Delete this event? 💔')) {
                                                await supabase.from('events').delete().eq('id', viewingEvent.id)
                                                setViewingEvent(null)
                                                fetchEvents()
                                            }
                                        }}
                                    >
                                        🗑️ Delete Event
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
