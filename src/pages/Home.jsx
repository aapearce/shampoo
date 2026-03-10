import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MODULES = [
  {
    num: '01', to: '/upload-assess', title: 'Upload & Assess', subtitle: 'Literary Evaluation', icon: '✍️',
    desc: 'Submit your creative writing — typed or photographed — for a detailed assessment against literary devices, narrative quality, and emotional depth.',
  },
  {
    num: '02', to: '/generate', title: 'Generate & Brainstorm', subtitle: 'Story Creation', icon: '✨',
    desc: 'Build stories with AI-guided inspiration. Choose story type, characters, and themes, then generate a complete story or brainstorm interactively.',
  },
  {
    num: '03', to: '/literary-devices', title: 'Literary Devices', subtitle: 'Explore & Learn', icon: '📖',
    desc: 'Master similes, metaphors, onomatopoeia, idioms, and more. See AI-generated examples alongside passages from classic English literature.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { badges, ageGroup } = useApp()
  const earnedCount = badges.filter(b => b.earned).length
  const recentBadges = badges.filter(b => b.earned).slice(0, 5)

  return (
    <div className="fade-up">
      {/* Hero */}
      <div className="mb-12">
        <p className="font-sans text-xs tracking-widest uppercase mb-3" style={{color:'#D4AF37'}}>Creative Writing</p>
        <h2 className="font-serif text-4xl mb-4 leading-tight" style={{color:'#F5ECD7'}}>
          Find your voice.<br />
          <span className="italic" style={{color:'#C8B99A'}}>Master the craft.</span>
        </h2>
        <div className="gold-bar w-24 mb-4" />
        <p className="font-sans text-sm max-w-xl leading-relaxed" style={{color:'#C8B99A'}}>
          A writing academy for curious minds aged 6–18. Choose a module below to get started.
          Currently viewing content for <span style={{color:'#D4AF37'}}>Ages {ageGroup}</span>.
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {MODULES.map((m, i) => (
          <button key={m.to} onClick={() => navigate(m.to)}
            className={`card-hover text-left p-6 relative overflow-hidden fade-up-delay-${i + 1}`}
            style={{background:'linear-gradient(135deg,#112040 0%,#0B1628 100%)', border:'1px solid #1A3358'}}>
            <span className="absolute right-4 top-2 font-serif text-6xl font-bold leading-none select-none pointer-events-none"
              style={{color:'rgba(212,175,55,0.07)'}}>{m.num}</span>
            <div className="text-2xl mb-3">{m.icon}</div>
            <div className="gold-bar w-8 mb-3" />
            <h3 className="font-serif text-lg mb-1" style={{color:'#F5ECD7'}}>{m.title}</h3>
            <p className="font-sans text-xs tracking-widest uppercase mb-3" style={{color:'#D4AF37'}}>{m.subtitle}</p>
            <p className="font-sans text-xs leading-relaxed" style={{color:'#C8B99A'}}>{m.desc}</p>
            <div className="mt-4">
              <span className="font-sans text-xs tracking-widest" style={{color:'#D4AF37'}}>Enter →</span>
            </div>
          </button>
        ))}
      </div>

      {/* Comprehension coming soon */}
      <div className="p-6 mb-12 flex items-center justify-between" style={{border:'1px dashed #1A3358'}}>
        <div>
          <h3 className="font-serif text-lg mb-1" style={{color:'rgba(245,236,215,0.3)'}}>Comprehension</h3>
          <p className="font-sans text-xs tracking-widest uppercase" style={{color:'#8A7A68'}}>Coming Soon</p>
        </div>
        <div className="font-serif text-4xl" style={{color:'#1A3358'}}>04</div>
      </div>

      {/* Badge summary */}
      {earnedCount > 0 && (
        <div className="p-6" style={{border:'1px solid #1A3358'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-sans text-xs tracking-widest uppercase mb-1" style={{color:'#D4AF37'}}>Your Collection</p>
              <h3 className="font-serif text-lg" style={{color:'#F5ECD7'}}>{earnedCount} Badge{earnedCount !== 1 ? 's' : ''} Earned</h3>
            </div>
            <button onClick={() => navigate('/badges')}
              className="font-sans text-xs tracking-widest transition-colors" style={{color:'#D4AF37'}}>
              View All →
            </button>
          </div>
          <div className="flex gap-3">
            {recentBadges.map(b => (
              <div key={b.id} className="badge-earned w-12 h-12 flex items-center justify-center text-2xl"
                style={{border:'1px solid rgba(212,175,55,0.4)'}} title={b.name}>
                {b.emoji}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
