// Mood data with messages and configuration
export const moods = [
    {
        id: 'happy',
        name: 'Happy',
        emoji: '😊',
        color: 'from-pink-400 to-rose-400',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-300'
    },
    {
        id: 'love',
        name: 'Love',
        emoji: '💕',
        color: 'from-rose-400 to-red-400',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-300'
    },
    {
        id: 'excited',
        name: 'Excited',
        emoji: '🤩',
        color: 'from-purple-400 to-pink-400',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300'
    },
    {
        id: 'grateful',
        name: 'Grateful',
        emoji: '🙏',
        color: 'from-amber-400 to-orange-400',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300'
    },
    {
        id: 'sad',
        name: 'Sad',
        emoji: '😢',
        color: 'from-blue-400 to-indigo-400',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300'
    },
    {
        id: 'stressed',
        name: 'Stressed',
        emoji: '😰',
        color: 'from-gray-400 to-slate-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300'
    }
]

// Messages for each mood (20 per mood)
export const moodMessages = {
    happy: [
        "Your smile brightens my entire day! Keep shining, beautiful! ✨",
        "Seeing you happy makes my heart dance with joy! 💃",
        "Your happiness is contagious - and I'm happily infected! 😊",
        "Nothing makes me happier than seeing that gorgeous smile of yours!",
        "You deserve all the happiness in the world, my love! 🌟",
        "Your joy is my favorite song - keep playing it! 🎵",
        "Happiness looks absolutely stunning on you! 💖",
        "I'm so blessed to witness your beautiful happiness every day!",
        "Your laughter is the sweetest melody to my ears! 🎶",
        "Keep spreading that wonderful joy of yours - the world needs it!",
        "Your happiness is like sunshine breaking through clouds! ☀️",
        "I fall in love with your smile over and over again!",
        "May your joy multiply a thousand times today! ✨",
        "Your cheerful spirit is one of the things I love most about you!",
        "Seeing you this happy makes everything worthwhile! 💕",
        "Your positive energy is absolutely infectious!",
        "I'm grateful every day for your amazing spirit!",
        "Your happiness is the best gift you could give me! 🎁",
        "Keep being the ray of sunshine that you are!",
        "Your joy brings color to my black and white world! 🌈"
    ],
    love: [
        "I love you more than words could ever express! 💕",
        "You're my forever and always, my beautiful love!",
        "Every moment with you feels like a dream come true! ✨",
        "You're not just my love, you're my best friend, my everything!",
        "My heart beats your name with every pulse! 💓",
        "Loving you is the easiest and most natural thing I've ever done!",
        "You are my today and all of my tomorrows! 🌟",
        "In a sea of people, my eyes will always search for you!",
        "You're the reason I believe in love at first sight! 👀",
        "Every love song suddenly makes sense when I think of you! 🎵",
        "You're my favorite notification, my favorite hello!",
        "I choose you. Every day. Over and over again! 💖",
        "You make my heart skip beats it shouldn't miss!",
        "Home isn't a place, it's being with you! 🏡",
        "You're the best thing that's ever been mine!",
        "I love you to the moon and back, and then some more! 🌙",
        "You're my once upon a time and happily ever after! 📖",
        "With you, I've found my forever person!",
        "You're not perfect, but you're perfect for me! 💝",
        "I didn't know what love was until I met you!"
    ],
    excited: [
        "Your excitement is absolutely adorable! Keep that energy! 🎉",
        "I can feel your excitement from here and it's making me smile!",
        "Your enthusiasm is one of the many things I adore about you! ✨",
        "I love how passionate and excited you get about things!",
        "Your excitement makes everything more fun and special!",
        "Can't wait to see what amazing things you'll do with all this energy! 🚀",
        "Your enthusiasm lights up the room! Keep shining!",
        "I'm excited because you're excited! That's how much I love you!",
        "Your positive energy is absolutely infectious! 💫",
        "Let's channel this excitement into amazing memories together!",
        "I love your childlike wonder and excitement! Never lose it!",
        "Your excitement makes ordinary moments extraordinary!",
        "I'm always here to match your energy and celebrate with you! 🎊",
        "Your enthusiasm is a beautiful reminder to enjoy life!",
        "Keep that fire burning bright, my love! 🔥",
        "Your excitement is the spark that ignites my day!",
        "I love how you find joy in the little things!",
        "Your energy is magnetic and I'm happily drawn to it!",
        "Let's make amazing memories with all this excitement!",
        "Your enthusiasm is absolutely contagious - and I love it! 💖"
    ],
    grateful: [
        "I'm so grateful for you every single day! 🙏",
        "Thank you for being you - you're absolutely amazing!",
        "I appreciate everything you do, big and small! 💕",
        "You're the blessing I never knew I needed!",
        "Grateful doesn't even begin to cover how I feel about having you!",
        "Thank you for choosing me every day!",
        "I count my blessings and you're always at the top! ✨",
        "You make my life infinitely better just by being in it!",
        "I'm thankful for every moment we share together!",
        "You're the answered prayer I didn't even know to ask for!",
        "Thank you for being my safe haven! 🏡",
        "I appreciate you more than words can say!",
        "Grateful for your love, your patience, and your beautiful soul!",
        "You're my biggest blessing! Thank you for existing! 🌟",
        "I'm thankful for your laughter, your hugs, your everything!",
        "You make gratitude feel like the easiest emotion!",
        "Thank you for making life an adventure! 🗺️",
        "I'm blessed beyond measure to have you in my life!",
        "Your love is the greatest gift I've ever received! 🎁",
        "Grateful for yesterday, today, and all our tomorrows together!"
    ],
    sad: [
        "It's okay to not be okay. I'm here for you, always! 💙",
        "Your feelings are valid. I'm holding space for you!",
        "Even on your hardest days, you're not alone. I'm right here!",
        "This too shall pass. I believe in you! 🌈",
        "It's okay to cry. Let it out. I'm here to wipe those tears!",
        "You're stronger than you know, braver than you believe!",
        "I'm sending you the biggest virtual hug right now! 🤗",
        "Tomorrow is a new day with new possibilities!",
        "Your feelings matter. I'm here to listen!",
        "Even storm clouds bring rain that helps flowers grow! 🌸",
        "I love you on your best days and your worst days!",
        "You don't have to be strong all the time. Lean on me!",
        "This feeling is temporary, but my love for you is forever!",
        "It's okay to take time to heal. I'll wait with you!",
        "You're allowed to feel everything you're feeling!",
        "I'm here - no judgment, just love and support! 💕",
        "Better days are coming. I promise!",
        "Your heart is safe with me. Let me help carry the weight!",
        "Even in darkness, you're my light! ✨",
        "I see you, I hear you, and I'm here for you!"
    ],
    stressed: [
        "Take a deep breath. You've got this! I believe in you! 💪",
        "Let's tackle this together, one step at a time!",
        "You're handling way more than anyone knows. I see you!",
        "It's okay to take a break. Rest is productive too! 😌",
        "You're stronger than this stress. I know you can do it!",
        "Remember: Progress, not perfection! You're doing great!",
        "Let's break this down into smaller, manageable pieces!",
        "I'm here to help shoulder the burden. What can I do?",
        "You've overcome 100% of your worst days so far!",
        "This stress is temporary, but your strength is permanent! 💫",
        "Don't forget to breathe. Seriously, take 3 deep breaths now!",
        "You're more capable than you give yourself credit for!",
        "It's okay to ask for help. That's strength, not weakness!",
        "Tomorrow's problems can wait. Focus on today! 📅",
        "You're doing amazing even when it doesn't feel like it!",
        "I'm proud of you for just showing up and trying!",
        "Let's find one small win today. That's enough! ✨",
        "Your wellbeing matters more than any deadline!",
        "You're not behind. Everyone moves at their own pace!",
        "I'm here whenever you need to talk or vent! 💕"
    ],
    special: [
        "Happy Anniversary! Every day with you feels like a celebration! 💖",
        "You're my favorite person in the entire universe! 🌟",
        "This date will forever be special because it's ours!",
        "Thank you for being my partner in this beautiful journey!",
        "Here's to many more years of love and laughter together! 🥂",
        "You make every day feel like our anniversary!",
        "I fall more in love with you with each passing day!",
        "Our love story is my favorite story ever told! 📖",
        "You're my greatest adventure and my safest home!",
        "Cheers to us and all the memories we've created! ✨",
        "Every moment with you is a treasure!",
        "You're not just my love, you're my destiny!",
        "I choose you today and every day after!",
        "Our love is my favorite kind of magic! ✨",
        "Thank you for making me the happiest person alive!",
        "Forever wouldn't be long enough with you!",
        "You're my always and forever! 💕",
        "This special day marks another year of us - my favorite 'us'!",
        "I love our story and I love writing it with you!",
        "Happy Anniversary to my one and only! 💖"
    ]
}

// Placeholder images (can be replaced with actual gallery photos)
export const placeholderImages = {
    happy: [
        '/placeholder-happy-1.jpg',
        '/placeholder-happy-2.jpg',
        '/placeholder-happy-3.jpg',
        '/placeholder-happy-4.jpg'
    ],
    love: [
        '/placeholder-love-1.jpg',
        '/placeholder-love-2.jpg',
        '/placeholder-love-3.jpg',
        '/placeholder-love-4.jpg'
    ],
    excited: [
        '/placeholder-excited-1.jpg',
        '/placeholder-excited-2.jpg',
        '/placeholder-excited-3.jpg',
        '/placeholder-excited-4.jpg'
    ],
    grateful: [
        '/placeholder-grateful-1.jpg',
        '/placeholder-grateful-2.jpg',
        '/placeholder-grateful-3.jpg',
        '/placeholder-grateful-4.jpg'
    ],
    sad: [
        '/placeholder-sad-1.jpg',
        '/placeholder-sad-2.jpg',
        '/placeholder-sad-3.jpg',
        '/placeholder-sad-4.jpg'
    ],
    stressed: [
        '/placeholder-stressed-1.jpg',
        '/placeholder-stressed-2.jpg',
        '/placeholder-stressed-3.jpg',
        '/placeholder-stressed-4.jpg'
    ],
    special: [
        '/placeholder-special-1.jpg',
        '/placeholder-special-2.jpg',
        '/placeholder-special-3.jpg',
        '/placeholder-special-4.jpg'
    ]
}
