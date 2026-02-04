import { useEffect, useState } from 'react'
import { Heart, Plus, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'

export default function LoveNotes() {
    const [notes, setNotes] = useState([])
    const [showWriteForm, setShowWriteForm] = useState(false)
    const [newNote, setNewNote] = useState('')
    const [saving, setSaving] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        getCurrentUser()
        fetchNotes()
        // Refresh every 30 seconds to check for new notes
        const interval = setInterval(fetchNotes, 30000)
        return () => clearInterval(interval)
    }, [])

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
    }

    const fetchNotes = async () => {
        try {
            // Fetch all non-expired notes
            const { data, error } = await supabase
                .from('love_notes')
                .select('*')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })

            if (error) throw error
            setNotes(data || [])
        } catch (error) {
            console.error('Error fetching notes:', error)
        }
    }

    const createNote = async () => {
        if (!newNote.trim()) return

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Extract username from email (e.g., "msp@example.com" -> "msp")
            const authorName = user.email?.split('@')[0] || 'Someone'

            const { error } = await supabase.from('love_notes').insert({
                from_user: user.id,
                author_name: authorName,
                note: newNote.trim()
            })

            if (error) throw error

            setNewNote('')
            setShowWriteForm(false)
            fetchNotes()
        } catch (error) {
            console.error('Error creating note:', error)
            alert('Failed to create note')
        } finally {
            setSaving(false)
        }
    }

    const revealNote = async (noteId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('love_notes')
                .update({
                    revealed_at: new Date().toISOString(),
                    revealed_by: user.id
                })
                .eq('id', noteId)

            if (error) throw error
            fetchNotes()
        } catch (error) {
            console.error('Error revealing note:', error)
        }
    }

    const deleteNote = async (noteId) => {
        try {
            const { error } = await supabase
                .from('love_notes')
                .delete()
                .eq('id', noteId)

            if (error) throw error
            fetchNotes()
        } catch (error) {
            console.error('Error deleting note:', error)
        }
    }

    const getTimeRemaining = (expiresAt) => {
        const now = new Date()
        const expires = new Date(expiresAt)
        const diff = expires - now

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (days > 0) return `${days}d ${hours}h`
        if (hours > 0) return `${hours}h`
        return 'Soon'
    }

    return (
        <div className="relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-heartbeat">
                        <Heart className="h-5 w-5 text-white fill-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Love Notes 💌
                    </h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWriteForm(!showWriteForm)}
                    className="hover:bg-pink-50 active:scale-95 transition-transform"
                >
                    <Plus className="h-4 w-4 text-rose-500" />
                </Button>
            </div>

            {/* Write Form */}
            {showWriteForm && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border-2 border-pink-200 mb-4">
                    <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Leave a sweet note... 💝"
                        className="min-h-[100px] resize-none border-pink-300 focus:border-rose-400 bg-white/80 mb-3"
                        maxLength={300}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {newNote.length}/300
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowWriteForm(false)
                                    setNewNote('')
                                }}
                                className="border-pink-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createNote}
                                disabled={!newNote.trim() || saving}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                            >
                                {saving ? 'Saving...' : 'Leave Note'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Display */}
            <div className="space-y-3">
                {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="mb-2">No love notes yet 💔</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowWriteForm(true)}
                            className="border-pink-300 hover:bg-pink-50"
                        >
                            Write the first one! ✨
                        </Button>
                    </div>
                ) : (
                    notes.map((note) => {
                        const isRevealed = note.revealed_at !== null
                        const isOwnNote = note.from_user === currentUser?.id
                        const authorName = note.author_name || 'Someone'

                        return (
                            <div
                                key={note.id}
                                className={`relative bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-300 shadow-md hover:shadow-lg transition-all ${!isRevealed && !isOwnNote ? 'cursor-pointer hover:scale-105' : ''
                                    }`}
                                onClick={() => {
                                    if (!isRevealed && !isOwnNote) {
                                        revealNote(note.id)
                                    }
                                }}
                            >
                                {/* Sticky note tape effect */}
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-yellow-200/60 rounded-sm"></div>

                                {!isRevealed && !isOwnNote ? (
                                    // Hidden state - show "Surprise!"
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <Sparkles className="h-8 w-8 text-amber-500 mb-2 animate-pulse" />
                                        <p className="text-2xl font-bold text-amber-600">
                                            Surprise! 🎁
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Tap to reveal
                                        </p>
                                    </div>
                                ) : (
                                    // Revealed state - show note
                                    <>
                                        <p className="text-gray-700 font-medium leading-relaxed mb-3">
                                            {note.note}
                                        </p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 italic">
                                                — {authorName}
                                            </span>
                                            <span className="text-amber-600 font-medium">
                                                {getTimeRemaining(note.expires_at)} left
                                            </span>
                                        </div>
                                        {isOwnNote && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (confirm('Delete this note?')) {
                                                        deleteNote(note.id)
                                                    }
                                                }}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
