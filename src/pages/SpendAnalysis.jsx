import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Plus, Download } from 'lucide-react'

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

export default function SpendAnalysis() {
    const [expenses, setExpenses] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [monthlyData, setMonthlyData] = useState([])
    const [totalSpent, setTotalSpent] = useState(0)

    // Filters
    const [filterType, setFilterType] = useState('all')
    const [filterUser, setFilterUser] = useState('all')

    // CSV Export date filters
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [user, setUser] = useState(null)
    const [profiles, setProfiles] = useState({})
    const [newExpense, setNewExpense] = useState({
        amount: '',
        description: '',
        category: 'other',
        expense_type: 'personal'
    })

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        fetchExpenses()
        fetchProfiles()
    }, [])

    const fetchProfiles = async () => {
        const { data } = await supabase.from('profiles').select('id, username, email')
        if (data) {
            const profileMap = {}
            data.forEach(p => profileMap[p.id] = p)
            setProfiles(profileMap)
        }
    }

    const fetchExpenses = async () => {
        const { data } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false })

        if (data) {
            setExpenses(data)
            processData(data)
        }
    }

    const processData = (data) => {
        // Apply filters
        let filteredData = data

        if (filterType !== 'all') {
            filteredData = filteredData.filter(exp => exp.expense_type === filterType)
        }

        if (filterUser !== 'all') {
            filteredData = filteredData.filter(exp => exp.paid_by === filterUser)
        }

        // Total spent
        const total = filteredData.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
        setTotalSpent(total)

        // Category breakdown
        const categoryMap = {}
        filteredData.forEach(exp => {
            if (!categoryMap[exp.category]) {
                categoryMap[exp.category] = 0
            }
            categoryMap[exp.category] += parseFloat(exp.amount)
        })

        const categoryArray = Object.keys(categoryMap).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: categoryMap[key]
        }))
        setCategoryData(categoryArray)

        // Monthly breakdown (last 6 months)
        const monthMap = {}
        filteredData.forEach(exp => {
            const date = new Date(exp.date)
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
            if (!monthMap[monthYear]) {
                monthMap[monthYear] = 0
            }
            monthMap[monthYear] += parseFloat(exp.amount)
        })

        const monthArray = Object.keys(monthMap).map(key => ({
            month: key,
            amount: monthMap[key]
        })).slice(0, 6).reverse()

        setMonthlyData(monthArray)
    }

    // Re-process when filters change
    useEffect(() => {
        if (expenses.length > 0) {
            processData(expenses)
        }
    }, [filterType, filterUser])

    const exportToCSV = () => {
        // Filter by date range
        let filteredData = expenses

        if (startDate) {
            filteredData = filteredData.filter(exp => {
                const expDate = new Date(exp.date)
                const start = new Date(startDate)
                return expDate >= start
            })
        }

        if (endDate) {
            filteredData = filteredData.filter(exp => {
                const expDate = new Date(exp.date)
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999) // Include entire end date
                return expDate <= end
            })
        }

        if (filteredData.length === 0) {
            alert('No expenses found in the selected date range!')
            return
        }

        // CSV headers
        const headers = ['Date', 'Description', 'Amount (₹)', 'Category', 'Type', 'Paid By']

        // CSV rows
        const rows = filteredData.map(exp => [
            new Date(exp.date).toLocaleDateString(),
            exp.description,
            exp.amount,
            exp.category,
            exp.expense_type,
            profiles[exp.paid_by]?.username || profiles[exp.paid_by]?.email || 'Unknown'
        ])

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)

        const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : `_${new Date().toISOString().split('T')[0]}`
        link.setAttribute('download', `expenses${dateRange}.csv`)

        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

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
            fetchExpenses()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-pink-200">
                    <div>
                        <h1 className="text-3xl font-bold text-rose-600 flex items-center gap-2">💰 Spend Analysis 💸</h1>
                        <p className="text-rose-500 flex items-center gap-1">✨ Track where your money goes 📊</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Close' : '+ Add Expense'}
                    </Button>
                </header>

                {/* Date Range Filters for CSV Export */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">📥 CSV Export Date Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border-2 border-pink-200 focus:border-pink-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border-2 border-pink-200 focus:border-pink-400"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Leave empty to export all expenses</p>
                        <Button
                            onClick={exportToCSV}
                            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </CardContent>
                </Card>

                {/* Filters for Charts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">📊 Chart Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Filter by Type</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="personal">💰 Personal</option>
                                    <option value="lent">💸 Lent</option>
                                    <option value="borrowed">💵 Borrowed</option>
                                    <option value="credit_card">💳 Credit Card</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Filter by Person</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={filterUser}
                                    onChange={(e) => setFilterUser(e.target.value)}
                                >
                                    <option value="all">Both</option>
                                    {Object.values(profiles).map(profile => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.username || profile.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Expense Form */}
                {showForm && (
                    <Card className="animate-in slide-in-from-top-2">
                        <CardHeader>
                            <CardTitle>Add Expense</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount (Rs)"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Description"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    required
                                />
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newExpense.expense_type}
                                    onChange={(e) => setNewExpense({ ...newExpense, expense_type: e.target.value })}
                                >
                                    <option value="personal">💰 Personal Expense</option>
                                    <option value="lent">💸 Money Lent (Given to someone)</option>
                                    <option value="borrowed">💵 Money Borrowed/Received Back</option>
                                    <option value="credit_card">💳 Credit Card Spend</option>
                                </select>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    <option value="food">🍔 Food</option>
                                    <option value="travel">✈️ Travel</option>
                                    <option value="date">💕 Date</option>
                                    <option value="bills">📄 Bills</option>
                                    <option value="shopping">🛍️ Shopping</option>
                                    <option value="other">📌 Other</option>
                                </select>
                                <Button type="submit" className="w-full">Save Expense</Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Summary Card */}
                <Card className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                    <CardHeader>
                        <CardTitle>Total Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-black">₹{totalSpent.toFixed(2)}</p>
                        <p className="text-sm opacity-90 mt-2">Across {expenses.length} transactions</p>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Category Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No data yet
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monthly Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {monthlyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                        <Bar dataKey="amount" fill="#8b5cf6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No data yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
