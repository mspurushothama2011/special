import NavBar from '../components/NavBar'

export default function Layout({ children }) {
    return (
        <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
            <NavBar />
            {children}
        </div>
    )
}
