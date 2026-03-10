import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MODULES = [
  {
    num: '01',
    to: '/upload-assess',
    title: 'Upload & Assess',
    subtitle: 'Literary Evaluation',
    desc: 'Submit your creative writing — typed or photographed — for a detailed assessment against literary devices, narrative quality, and emotional depth.',
    icon: '✍️',
  },
  {
    num: '02',
    to: '/generate',
    title: 'Generate & Brainstorm',
    subtitle: 'Story Creation',
    desc: 'Build stories with AI-guided inspiration. Choose story type, characters, and themes, then generate a complete story or brainstorm interactively.',
    icon: '✨',
  },
  {
    num: '03',
    to: '/literary-devices',
    title: 'Literary Devices',
    subtitle: 'Explore & Learn',
    desc: 'Master similes, metaphors, onomatopoeia, idioms, and more. See AI-generated examples alongside passages from classic English literature.',
    icon: '📖',
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
        <p className="font-sans text-xs tracking-widest text-gold uppercase mb-3">Creative Writing</p>
        <h2 className="font-serif text-4xl text-silver mb-4 leading-tight">
          Find your voice.<br />
          <span className="italic text-silver/60">Master the craft.</span>
        </h2>
        <div className="gold-bar w-24 mb-4" />
        <p className="font-sans text-sm text-g600 max-w-xl leading-relaxed">
          A writing academy for curious minds aged 6–18. Choose a module below to get started.
          Currently viewing content for <span className="text-gold">Ages {ageGroup}</span>.
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {MODULES.map((m, i) => (
          <button
            key={m.to}
            onClick={() => navigate(m.to)}
            className={`card-hover text-left border border-g800 p-6 relative overflow-hidden fade-up-delay-${i + 1}`}
            style={{ background: 'linear-gradient(135deg, #1a2332 0%, #111827 100%)' }}
          >
            {/* Large background number */}
            <span
              className="absolute right-4 top-2 font-serif text-6xl font-bold leading-none select-none pointer-events-none"
              style={{ color: 'rgba(212,175,55,0.06)' }}
            >
              {m.num}
            </span>

            <div className="text-2xl mb-3">{m.icon}</div>
            <div className="gold-bar w-8 mb-3" />
            <h3 className="font-serif text-lg text-silver mb-1">{m.title}</h3>
            <p className="font-sans text-xs text-gold tracking-widest uppercase mb-3">{m.subtitle}</p>
            <p className="font-sans text-xs text-g600 leading-relaxed">{m.desc}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="font-sans text-xs text-gold tracking-widest">Enter →</span>
            </div>
          </button>
        ))}
      </div>

      {/* Comprehension coming soon */}
      <div className="border border-dashed border-g800 p-6 mb-12 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg text-silver/40 mb-1">Comprehension</h3>
          <p className="font-sans text-xs text-g600 tracking-widest uppercase">Coming Soon</p>
        </div>
        <div className="font-serif text-4xl text-g800">04</div>
      </div>

      {/* Badge summary */}
      {earnedCount > 0 && (
        <div className="border border-g800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-sans text-xs tracking-widest text-gold uppercase mb-1">Your Collection</p>
              <h3 className="font-serif text-lg text-silver">{earnedCount} Badge{earnedCount !== 1 ? 's' : ''} Earned</h3>
            </div>
            <button
              onClick={() => navigate('/badges')}
              className="font-sans text-xs text-gold tracking-widest hover:text-gold-light transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="flex gap-3">
            {recentBadges.map(b => (
              <div key={b.id} className="badge-earned w-12 h-12 border border-gold/40 flex items-center justify-center text-2xl" title={b.name}>
                {b.emoji}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
