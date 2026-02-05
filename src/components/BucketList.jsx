import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, Check, X, CheckCircle2, Circle } from "lucide-react"
import { format } from "date-fns"

export default function BucketList() {
    const [items, setItems] = useState([])
    const [newItem, setNewItem] = useState({ title: '', description: '' })
    const [editingItem, setEditingItem] = useState(null)
    const [isAdding, setIsAdding] = useState(false)
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id)
        })
        fetchItems()

        // Subscribe to changes
        const subscription = supabase
            .channel('bucket_list_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bucket_list' }, fetchItems)
            .subscribe()

        return () => subscription.unsubscribe()
    }, [])

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('bucket_list')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setItems(data)
    }

    const handleAdd = async () => {
        if (!newItem.title) return

        if (!userId) {
            alert('Please log in to add items')
            return
        }

        const { error } = await supabase
            .from('bucket_list')
            .insert([{
                title: newItem.title,
                description: newItem.description,
                created_by: userId
            }])

        if (!error) {
            setNewItem({ title: '', description: '' })
            setIsAdding(false)
            fetchItems()
        } else {
            console.error('Error adding item:', error)
            alert('Failed to add item: ' + (error.message || 'Unknown error'))
        }
    }

    const handleUpdate = async () => {
        if (!editingItem || !editingItem.title) return

        const { error } = await supabase
            .from('bucket_list')
            .update({
                title: editingItem.title,
                description: editingItem.description
            })
            .eq('id', editingItem.id)

        if (!error) {
            setEditingItem(null)
            fetchItems()
        }
    }

    const toggleComplete = async (item) => {
        const { error } = await supabase
            .from('bucket_list')
            .update({ is_completed: !item.is_completed })
            .eq('id', item.id)

        if (!error) fetchItems()
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this wish?')) return

        const { error } = await supabase
            .from('bucket_list')
            .delete()
            .eq('id', id)

        if (!error) fetchItems()
    }

    return (
        <Card className="h-full bg-white/50 backdrop-blur-sm border-2 border-indigo-200 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-indigo-50/50">
                <CardTitle className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                    🌟 Bucket List
                </CardTitle>
                <Button
                    size="sm"
                    variant={isAdding ? "secondary" : "default"}
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {isAdding && (
                    <div className="space-y-3 p-3 bg-white rounded-lg border border-indigo-100 shadow-sm animate-in slide-in-from-top-2">
                        <Input
                            placeholder="What's your wish?"
                            value={newItem.title}
                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            className="border-indigo-200 focus-visible:ring-indigo-400"
                        />
                        <Input
                            placeholder="Description (max 300 chars)"
                            maxLength={300}
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            className="border-indigo-200 focus-visible:ring-indigo-400"
                        />
                        <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Add to List ✨
                        </Button>
                    </div>
                )}

                <div className="space-y-3">
                    {items.length === 0 && !isAdding && (
                        <p className="text-center text-muted-foreground py-8">No wishes yet. Start dreaming! ✨</p>
                    )}

                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`group relative p-3 rounded-lg border transition-all duration-200 
                                ${item.is_completed
                                    ? 'bg-green-50/50 border-green-200 opacity-75'
                                    : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-md'
                                }`}
                        >
                            {editingItem?.id === item.id ? (
                                <div className="space-y-2">
                                    <Input
                                        value={editingItem.title}
                                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                        className="h-8"
                                    />
                                    <Input
                                        value={editingItem.description}
                                        maxLength={300}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="h-8"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
                                        <Button size="sm" onClick={handleUpdate}>Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => toggleComplete(item)}
                                        className={`mt-1 transition-colors ${item.is_completed ? 'text-green-500' : 'text-slate-300 hover:text-indigo-400'}`}
                                    >
                                        {item.is_completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <h4 className={`font-medium truncate ${item.is_completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.created_by === userId && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                                                            onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-400 hover:text-red-600"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p className="text-sm text-slate-500 truncate">{item.description}</p>
                                        )}

                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                            <span>📅 {format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                                            {/* We could add 'By: User' here if we joined with profiles */}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
