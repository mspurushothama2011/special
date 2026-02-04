import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export default function Chat() {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [user, setUser] = useState(null)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        fetchMessages()

        // Set up real-time subscription
        const channel = supabase
            .channel('messages-channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    setMessages(prev => {
                        const exists = prev.some(m => m.id === payload.new.id)
                        if (exists) return prev
                        // Filter out optimistic messages and add the real one
                        return [...prev.filter(m => typeof m.id !== 'number'), payload.new]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchMessages = async () => {
        // Delete messages older than 2 years
        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

        await supabase
            .from('messages')
            .delete()
            .lt('created_at', twoYearsAgo.toISOString())

        // Fetch remaining messages
        const { data } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })

        if (data) setMessages(data)
    }

    // Helper function to check if two dates are on different days
    const isDifferentDay = (date1, date2) => {
        const d1 = new Date(date1)
        const d2 = new Date(date2)
        return d1.toDateString() !== d2.toDateString()
    }

    // Helper function to format date divider
    const formatDateDivider = (date) => {
        const d = new Date(date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (d.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (d.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !user) return

        // Optimistically add message to UI immediately
        const optimisticMessage = {
            id: Date.now(), // Temporary ID
            content: newMessage,
            sender_id: user.id,
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, optimisticMessage])
        setNewMessage('')

        // Then save to database
        const { error } = await supabase.from('messages').insert({
            content: optimisticMessage.content,
            sender_id: user.id
        })

        if (error) {
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
            setNewMessage(optimisticMessage.content) // Restore the message
            alert('Failed to send message. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
                <header className="bg-white/60 backdrop-blur-sm border-2 border-pink-200 p-6 rounded-2xl shadow-lg">
                    <h1 className="text-2xl font-bold text-rose-600 flex items-center gap-2">💬 Chat 💕</h1>
                    <p className="text-sm text-rose-500 flex items-center gap-1">✨ Stay connected 💞</p>
                </header>
                <Card className="h-[calc(100vh-8rem)]">
                    <CardContent className="flex flex-col h-[calc(100%-5rem)]">
                        {/* Messages Container */}
                        {/* Messages */}
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-4 p-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">
                                    No messages yet. Say hi! 👋
                                </div>
                            ) : (
                                messages.map((message, index) => {
                                    const showDateDivider = index === 0 || isDifferentDay(
                                        messages[index - 1].created_at,
                                        message.created_at
                                    )
                                    const isCurrentUser = message.sender_id === user?.id

                                    return (
                                        <div key={message.id}>
                                            {/* Date Divider */}
                                            {showDateDivider && (
                                                <div className="flex items-center justify-center my-6">
                                                    <div className="flex-1 border-t-2 border-pink-200"></div>
                                                    <div className="px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full mx-4">
                                                        <p className="text-sm font-semibold text-rose-600">
                                                            {formatDateDivider(message.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="flex-1 border-t-2 border-pink-200"></div>
                                                </div>
                                            )}

                                            {/* Message Bubble */}
                                            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[70%] p-3 rounded-2xl ${isCurrentUser
                                                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                                                            : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800'
                                                        }`}
                                                >
                                                    <p className="break-words">{message.content}</p>
                                                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-pink-100' : 'text-rose-400'}`}>
                                                        {new Date(message.created_at).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSend} className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
