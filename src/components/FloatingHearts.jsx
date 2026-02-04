import { useEffect, useState } from 'react'

export default function FloatingHearts() {
    const [hearts, setHearts] = useState([])

    useEffect(() => {
        const heartEmojis = ['💕', '💖', '💗', '💓', '💝', '💘', '❤️', '🌸', '🌺', '✨']
        const newHearts = []

        for (let i = 0; i < 15; i++) {
            newHearts.push({
                id: i,
                emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
                left: Math.random() * 100,
                animationDuration: 10 + Math.random() * 10,
                animationDelay: Math.random() * 5,
                size: 1 + Math.random() * 1.5,
                opacity: 0.1 + Math.random() * 0.2
            })
        }

        setHearts(newHearts)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute"
                    style={{
                        left: `${heart.left}%`,
                        fontSize: `${heart.size}rem`,
                        opacity: heart.opacity,
                        animation: `float ${heart.animationDuration}s ease-in-out infinite`,
                        animationDelay: `${heart.animationDelay}s`,
                        bottom: '-50px'
                    }}
                >
                    {heart.emoji}
                </div>
            ))}

            <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: ${props => props.opacity || 0.2};
          }
          90% {
            opacity: ${props => props.opacity || 0.2};
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    )
}
