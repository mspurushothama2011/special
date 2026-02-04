import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus } from 'lucide-react'

export default function ExpenseTracker() {
    const [showForm, setShowForm] = useState(false)
    const [user, setUser] = useState(null)
    const [newExpense, setNewExpense] = useState({
        amount: '',
        description: '',
        category: 'other',
        expense_type: 'personal' // personal, lent, borrowed, credit_card
    })

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [])

    const handleAddExpense = async (e) => {
        e.preventDefault()
        if (!user) return

        const { error } = await supabase.from('expenses').insert({
            amount: parseFloat(newExpense.amount),
            description: newExpense.description,
            category: newExpense.category,
            expense_type: newExpense.expense_type,
            paid_by: user.id
        })

        if (!error) {
            setNewExpense({ amount: '', description: '', category: 'other', expense_type: 'personal' })
            setShowForm(false)
            alert('Expense added successfully!')
        } else {
            alert('Failed to add expense')
        }
    }

    return (
        <Card className="border-none shadow-none bg-transparent h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-rose-600 flex items-center gap-2">
                        💰 Quick Add
                    </CardTitle>
                    <Button
                        size="sm"
                        onClick={() => setShowForm(!showForm)}
                        className="love-button bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-none"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {showForm && (
                    <form onSubmit={handleAddExpense} className="space-y-3">
                        <div className="space-y-2">
                            <Input
                                type="number"
                                placeholder="Amount (₹)"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                required
                                className="border-2 border-pink-200 focus:border-pink-400 rounded-xl"
                            />
                            <Input
                                placeholder="Description"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                required
                                className="border-2 border-pink-200 focus:border-pink-400 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <select
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                className="w-full p-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400"
                            >
                                <option value="food">🍔 Food</option>
                                <option value="transport">🚗 Transport</option>
                                <option value="entertainment">🎬 Entertainment</option>
                                <option value="bills">💳 Bills</option>
                                <option value="shopping">🛍️ Shopping</option>
                                <option value="other">📦 Other</option>
                            </select>

                            <select
                                value={newExpense.expense_type}
                                onChange={(e) => setNewExpense({ ...newExpense, expense_type: e.target.value })}
                                className="w-full p-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400"
                            >
                                <option value="personal">💰 Personal</option>
                                <option value="lent">💸 Lent</option>
                                <option value="borrowed">💵 Borrowed</option>
                                <option value="credit_card">💳 Credit Card</option>
                            </select>
                        </div>
                        <Button
                            type="submit"
                            className="w-full love-button bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-none rounded-xl"
                        >
                            Save Expense 💝
                        </Button>
                    </form>
                )}
                {!showForm && (
                    <div className="text-center py-8 text-rose-400">
                        <p className="text-4xl mb-2">💸</p>
                        <p className="text-sm font-medium">Click "Add" to track expenses</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
