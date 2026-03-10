import { useApp } from '../context/AppContext'

const RARITY_COLORS = {
  common: 'border-g700 text-g600',
  rare: 'border-oxford text-oxford',
  legendary: 'border-gold text-gold',
}
const RARITY_LABELS = { common: 'Common', rare: 'Rare', legendary: 'Legendary' }

export default function Badges() {
  const { badges } = useApp()
  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  const byRarity = (list) => ({
    legendary: list.filter(b => b.rarity === 'legendary'),
    rare: list.filter(b => b.rarity === 'rare'),
    common: list.filter(b => b.rarity === 'common'),
  })

  return (
    <div className="fade-up max-w-4xl">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest text-gold uppercase mb-2">Collection</p>
        <h2 className="font-serif text-3xl text-silver mb-2">Your Badges</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm text-g600">
          Earn badges by demonstrating mastery of literary devices in your writing assessments.
          <span className="text-gold ml-2">{earned.length}/{badges.length} collected.</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="border border-g800 p-4 mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-sans text-xs text-g600 tracking-widest uppercase">Collection Progress</span>
          <span className="font-sans text-xs text-gold">{Math.round((earned.length/badges.length)*100)}%</span>
        </div>
        <div className="h-2 bg-g800 overflow-hidden">
          <div className="h-full transition-all duration-1000" style={{
            width: `${(earned.length/badges.length)*100}%`,
            background: 'linear-gradient(90deg, #1F3A5F, #D4AF37)'
          }} />
        </div>
      </div>

      {/* Earned section */}
      {earned.length > 0 && (
        <div className="mb-10">
          <p className="font-sans text-xs text-gold tracking-widest uppercase mb-4">Earned</p>
          {['legendary','rare','common'].map(rarity => {
            const group = byRarity(earned)[rarity]
            if (!group.length) return null
            return (
              <div key={rarity} className="mb-6">
                <p className={`font-sans text-xs tracking-widest uppercase mb-3 ${RARITY_COLORS[rarity]}`}>
                  ✦ {RARITY_LABELS[rarity]}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {group.map(b => (
                    <div key={b.id} className={`badge-earned border p-3 flex flex-col items-center gap-1 ${RARITY_COLORS[rarity]}`}>
                      <span className="text-3xl">{b.emoji}</span>
                      <span className="font-serif text-xs text-silver text-center">{b.name}</span>
                      <span className="font-sans text-xs text-g600 text-center leading-tight">{b.device}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Locked section */}
      {locked.length > 0 && (
        <div>
          <p className="font-sans text-xs text-g700 tracking-widest uppercase mb-4">Locked — Keep Writing to Unlock</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {locked.map(b => (
              <div key={b.id} className="border border-dashed border-g800 p-3 flex flex-col items-center gap-1 opacity-30">
                <span className="text-3xl grayscale">{b.emoji}</span>
                <span className="font-serif text-xs text-g600 text-center">???</span>
                <span className={`font-sans text-xs tracking-widest uppercase text-center ${RARITY_COLORS[b.rarity]}`}>
                  {RARITY_LABELS[b.rarity]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="border border-dashed border-g800 p-10 text-center mt-4">
          <p className="font-sans text-sm text-g700">No badges earned yet. Submit a writing piece for assessment to earn your first badge!</p>
        </div>
      )}
    </div>
  )
}
