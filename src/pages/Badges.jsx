import { useApp } from '../context/AppContext'

const RARITY = {
  common:    { border: '#2A4A6B', label: '#8A7A68' },
  rare:      { border: '#1F3A5F', label: '#7A9CC0' },
  legendary: { border: '#D4AF37', label: '#D4AF37' },
}
const RARITY_LABELS = { common: 'Common', rare: 'Rare', legendary: 'Legendary' }

export default function Badges() {
  const { badges } = useApp()
  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  const byRarity = list => ({
    legendary: list.filter(b => b.rarity === 'legendary'),
    rare:      list.filter(b => b.rarity === 'rare'),
    common:    list.filter(b => b.rarity === 'common'),
  })

  return (
    <div className="fade-up max-w-4xl">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={{color:'#D4AF37'}}>Collection</p>
        <h2 className="font-serif text-3xl mb-2" style={{color:'#F5ECD7'}}>Your Badges</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={{color:'#C8B99A'}}>
          Earn badges by demonstrating mastery of literary devices in your writing assessments.
          <span className="ml-2" style={{color:'#D4AF37'}}>{earned.length}/{badges.length} collected.</span>
        </p>
      </div>

      {/* Progress */}
      <div className="p-4 mb-8" style={{border:'1px solid #1A3358'}}>
        <div className="flex justify-between mb-2">
          <span className="font-sans text-xs tracking-widest uppercase" style={{color:'#8A7A68'}}>Collection Progress</span>
          <span className="font-sans text-xs" style={{color:'#D4AF37'}}>{Math.round((earned.length/badges.length)*100)}%</span>
        </div>
        <div className="h-2 overflow-hidden" style={{background:'#112040'}}>
          <div className="h-full transition-all duration-1000"
            style={{width:`${(earned.length/badges.length)*100}%`, background:'linear-gradient(90deg,#1F3A5F,#D4AF37)'}} />
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="mb-10">
          <p className="font-sans text-xs tracking-widest uppercase mb-4" style={{color:'#D4AF37'}}>Earned</p>
          {['legendary','rare','common'].map(rarity => {
            const group = byRarity(earned)[rarity]
            if (!group.length) return null
            return (
              <div key={rarity} className="mb-6">
                <p className="font-sans text-xs tracking-widest uppercase mb-3" style={{color:RARITY[rarity].label}}>
                  ✶ {RARITY_LABELS[rarity]}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {group.map(b => (
                    <div key={b.id} className="badge-earned p-3 flex flex-col items-center gap-1"
                      style={{border:`1px solid ${RARITY[rarity].border}`}}>
                      <span className="text-3xl">{b.emoji}</span>
                      <span className="font-serif text-xs text-center" style={{color:'#F5ECD7'}}>{b.name}</span>
                      <span className="font-sans text-xs text-center leading-tight" style={{color:'#C8B99A'}}>{b.device}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <p className="font-sans text-xs tracking-widest uppercase mb-4" style={{color:'#8A7A68'}}>Locked — Keep Writing to Unlock</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {locked.map(b => (
              <div key={b.id} className="p-3 flex flex-col items-center gap-1 opacity-30"
                style={{border:'1px dashed #1A3358'}}>
                <span className="text-3xl grayscale">{b.emoji}</span>
                <span className="font-serif text-xs" style={{color:'#8A7A68'}}>???</span>
                <span className="font-sans text-xs tracking-widest uppercase" style={{color:RARITY[b.rarity].label}}>
                  {RARITY_LABELS[b.rarity]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="p-10 text-center mt-4" style={{border:'1px dashed #1A3358'}}>
          <p className="font-sans text-sm" style={{color:'#8A7A68'}}>No badges earned yet. Submit a writing piece for assessment to earn your first badge!</p>
        </div>
      )}
    </div>
  )
}
