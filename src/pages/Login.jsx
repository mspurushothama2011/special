import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

// Fixed username to email mapping
const USERNAME_MAP = {
    'msp': 'msp@couple.app',
    'abi': 'abi@couple.app'
}

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Convert username to email
        const email = USERNAME_MAP[username.toLowerCase()]

        if (!email) {
            setError("Invalid username. Please use 'msp' or 'abi'")
            setLoading(false)
            return
        }

        if (!supabase) {
            setError("Supabase not initialized. Check console/env.")
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            navigate('/')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 p-4">
            <Card className="w-full max-w-md shadow-2xl border-2 border-pink-200">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-rose-600">Unified Hearts 💖</CardTitle>
                    <CardDescription>Welcome back! Enter your credentials</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                type="text"
                                placeholder="partner1 or partner2"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Use: msp or abi</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center text-xs text-muted-foreground">
                    Built with ❤️ for us.
                </CardFooter>
            </Card>
        </div>
    )
}
