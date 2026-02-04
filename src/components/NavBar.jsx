import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ImageIcon, DollarSign, Calendar, MessageCircle, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NavBar() {
    const navigate = useNavigate()
    const location = useLocation()

    const links = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/gallery', icon: ImageIcon, label: 'Gallery' },
        { path: '/analysis', icon: DollarSign, label: 'Finances' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/moodhub', icon: Brain, label: 'MoodHub' },
        { path: '/chat', icon: MessageCircle, label: 'Chat' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:top-0 md:bottom-auto z-50">
            <div className="max-w-5xl mx-auto flex justify-around md:justify-center md:gap-8 py-3">
                {links.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={cn(
                                'flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-colors',
                                isActive
                                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs md:text-sm font-medium">{label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
