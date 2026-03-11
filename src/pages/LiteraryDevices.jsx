import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'
import { fetchGutenbergPassages } from '../lib/gutenberg'

// ── Device palette — each gets a distinct colour family ───────────────────────
const DEVICES = [
  { name: 'Simile',                   def: 'A comparison using "like" or "as"',                               emoji: '🌸', hue: '#7C3AED', accent: '#C4B5FD' },
  { name: 'Metaphor',                 def: 'A direct comparison without "like" or "as"',                      emoji: '🌻', hue: '#B45309', accent: '#FCD34D' },
  { name: 'Personification',          def: 'Giving human qualities to non-human things',                     emoji: '🪻', hue: '#0F766E', accent: '#5EEAD4' },
  { name: 'Alliteration',             def: 'Repetition of the same initial consonant sound',                 emoji: '🌷', hue: '#BE185D', accent: '#FBCFE8' },
  { name: 'Onomatopoeia',             def: 'Words that sound like what they describe',                       emoji: '🥐', hue: '#B45309', accent: '#FDE68A' },
  { name: 'Hyperbole',                def: 'Extreme exaggeration for effect',                                emoji: '🍰', hue: '#DC2626', accent: '#FCA5A5' },
  { name: 'Idiom',                    def: 'A phrase whose meaning differs from its literal words',          emoji: '🍩', hue: '#7C3AED', accent: '#DDD6FE' },
  { name: 'Imagery',                  def: 'Language that appeals to the senses',                            emoji: '🌹', hue: '#0369A1', accent: '#7DD3FC' },
  { name: 'Irony',                    def: 'When the opposite of what is expected occurs',                   emoji: '🐝', hue: '#4D7C0F', accent: '#BEF264' },
  { name: 'Symbolism',                def: 'Using an object or action to represent something else',          emoji: '🦋', hue: '#1D4ED8', accent: '#93C5FD' },
  { name: 'Foreshadowing',            def: 'Hints at future events in the story',                            emoji: '🍜', hue: '#374151', accent: '#9CA3AF' },
  { name: 'Flashback',                def: 'A scene set in an earlier time than the main story',             emoji: '🐠', hue: '#0F766E', accent: '#99F6E4' },
  { name: 'Dialogue',                 def: 'Conversation between characters',                                emoji: '🧁', hue: '#B45309', accent: '#FEF08A' },
  { name: 'Oxymoron',                 def: 'Two contradictory terms used together',                          emoji: '🦊', hue: '#DC2626', accent: '#FEE2E2' },
  { name: 'Allusion',                 def: 'A reference to a well-known person, place, or event',            emoji: '🦚', hue: '#065F46', accent: '#6EE7B7' },
  { name: 'Anaphora',                 def: 'Repetition of a word or phrase at the start of successive lines',emoji: '🌺', hue: '#BE185D', accent: '#F9A8D4' },
  { name: 'Juxtaposition',            def: 'Placing two contrasting things side by side',                    emoji: '🌿', hue: '#1E3A5F', accent: '#7DD3FC' },
  { name: 'Assonance',                def: 'Repetition of vowel sounds in nearby words',                    emoji: '🍃', hue: '#166534', accent: '#86EFAC' },
  { name: 'Euphemism',                def: 'A mild word substituted for one that might seem harsh',          emoji: '🌾', hue: '#78350F', accent: '#FDE68A' },
  { name: 'Allegory',                 def: 'A story with a hidden meaning, often moral or political',       emoji: '🪷', hue: '#5B21B6', accent: '#C4B5FD' },
  { name: 'Motif',                    def: 'A recurring element that has symbolic significance',             emoji: '🌙', hue: '#1E3A5F', accent: '#A5B4FC' },
  { name: 'Paradox',                  def: 'A statement that seems contradictory but contains a truth',     emoji: '🌊', hue: '#0369A1', accent: '#BAE6FD' },
  { name: 'Extended Metaphor',        def: 'A metaphor sustained throughout a passage or whole work',        emoji: '🦚', hue: '#065F46', accent: '#A7F3D0' },
  { name: 'Stream of Consciousness',  def: 'Writing that depicts the uninterrupted flow of thoughts',       emoji: '🌀', hue: '#312E81', accent: '#C7D2FE' },
  { name: 'Tone',                     def: "The author's attitude toward the subject or audience",           emoji: '🎵', hue: '#831843', accent: '#FBCFE8' },
  { name: 'Mood',                     def: 'The atmosphere or emotional feeling of a piece',                 emoji: '🌅', hue: '#92400E', accent: '#FCD34D' },
  { name: 'Understatement',           def: 'Deliberately making something seem less than it is',             emoji: '🤫', hue: '#374151', accent: '#D1D5DB' },
  { name: 'Sarcasm',                  def: 'A form of irony intended to mock or show contempt',              emoji: '😏', hue: '#7F1D1D', accent: '#FCA5A5' },
  { name: 'Point of View',            def: 'The perspective from which a story is narrated',                emoji: '👁️', hue: '#0C4A6E', accent: '#7DD3FC' },
  { name: 'Flashforward',             def: 'A scene set in a future time from the main narrative',           emoji: '⏩', hue: '#1E3A5F', accent: '#A5F3FC' },
]

const S = {
  page:   { color: '#F5ECD7' },
  label:  { color: '#D4AF37' },
  body:   { color: '#C8B99A' },
  hint:   { color: '#8A7A68' },
  border: { border: '1px solid #1A3358' },
  card:   { background: 'linear-gradient(135deg,#112040,#0B1628)', border: '1px solid #1A3358' },
  input:  { background: 'rgba(17,32,64,0.6)', border: '1px solid #1A3358', color: '#F5ECD7' },
}

// ── Flip card ──────────────────────────────────────────────────────────────────
function FlashCard({ device, isActive, onToggle }) {
  const [hover, setHover] = useState(false)
  const flipped = isActive

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer select-none"
      style={{
        perspective: '1000px',
        height: '200px',
        transition: 'transform 0.18s ease',
        transform: hover && !flipped ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

        {/* ── Front face ── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          background: `linear-gradient(145deg, ${device.hue}22 0%, #0B1628 60%, ${device.hue}11 100%)`,
          border: `1px solid ${device.hue}55`,
          boxShadow: hover
            ? `0 8px 32px ${device.hue}33, inset 0 0 20px ${device.hue}11`
            : `0 2px 8px rgba(0,0,0,0.4)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 14px 14px',
          overflow: 'hidden',
        }}>
          {/* Corner ornaments */}
          <svg style={{ position: 'absolute', top: 6, left: 6, opacity: 0.35 }} width="18" height="18" viewBox="0 0 18 18">
            <path d="M1 9 L1 1 L9 1" stroke={device.accent} strokeWidth="1.5" fill="none"/>
          </svg>
          <svg style={{ position: 'absolute', top: 6, right: 6, opacity: 0.35 }} width="18" height="18" viewBox="0 0 18 18">
            <path d="M17 9 L17 1 L9 1" stroke={device.accent} strokeWidth="1.5" fill="none"/>
          </svg>
          <svg style={{ position: 'absolute', bottom: 6, left: 6, opacity: 0.35 }} width="18" height="18" viewBox="0 0 18 18">
            <path d="M1 9 L1 17 L9 17" stroke={device.accent} strokeWidth="1.5" fill="none"/>
          </svg>
          <svg style={{ position: 'absolute', bottom: 6, right: 6, opacity: 0.35 }} width="18" height="18" viewBox="0 0 18 18">
            <path d="M17 9 L17 17 L9 17" stroke={device.accent} strokeWidth="1.5" fill="none"/>
          </svg>

          {/* Accent stripe at top */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px',
            background: `linear-gradient(90deg, transparent, ${device.accent}88, transparent)`,
          }} />

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ fontSize: '36px', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
              {device.emoji}
            </span>
            <span
              className="font-serif text-base text-center leading-tight"
              style={{ color: '#F5ECD7', letterSpacing: '0.02em', fontWeight: 500 }}
            >
              {device.name}
            </span>
            <span style={{
              display: 'inline-block', width: 28, height: 1,
              background: `linear-gradient(90deg, transparent, ${device.accent}99, transparent)`,
            }} />
          </div>

          <span
            className="font-sans text-xs"
            style={{ color: `${device.accent}77`, letterSpacing: '0.08em', fontSize: '10px', textTransform: 'uppercase' }}
          >
            tap to explore
          </span>
        </div>

        {/* ── Back face — definition ── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: `linear-gradient(145deg, #0B1628 0%, ${device.hue}33 100%)`,
          border: `1px solid ${device.accent}55`,
          boxShadow: `0 8px 32px ${device.hue}44`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 16px 14px',
          overflow: 'hidden',
        }}>
          {/* Radial glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 50% 40%, ${device.hue}22 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Bottom accent stripe */}
          <div style={{
            position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '2px',
            background: `linear-gradient(90deg, transparent, ${device.accent}66, transparent)`,
          }} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', zIndex: 1 }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: device.accent, opacity: 0.85 }}>
              {device.name}
            </span>
            <p
              className="font-serif text-sm text-center leading-relaxed"
              style={{ color: '#F5ECD7', maxWidth: '160px' }}
            >
              {device.def}
            </p>
          </div>

          <span
            className="font-sans text-xs"
            style={{ color: `${device.accent}66`, letterSpacing: '0.08em', fontSize: '10px', textTransform: 'uppercase', zIndex: 1 }}
          >
            tap to close
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Classic passage card ───────────────────────────────────────────────────────
function ClassicCard({ c }) {
  const [expanded, setExpanded] = useState(false)
  const [fullText, setFullText] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleExpand() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (fullText) return
    setLoading(true)
    try {
      const result = await claudeChat({
        messages: [{ role: 'user', content:
          `Extend the following passage from "${c.source}" by adding the sentences immediately before and after it. Passage:\n\n"${c.text}"\n\nReturn only the extended passage, no preamble. Around 10–15 lines.`
        }]
      })
      setFullText(result)
    } catch { setFullText('Could not load additional context.') }
    setLoading(false)
  }

  return (
    <div className="p-4" style={{ background: 'rgba(17,32,64,0.4)', border: '1px solid #1A3358' }}>
      <p className="font-serif text-sm italic leading-relaxed mb-3" style={{ color: 'rgba(245,236,215,0.8)' }}>
        {c.text}
      </p>
      {expanded && (
        <div className="mb-3 pt-3" style={{ borderTop: '1px solid #1A3358' }}>
          {loading
            ? <p className="font-sans text-xs italic" style={S.hint}>Loading context...</p>
            : <p className="font-serif text-sm italic leading-relaxed" style={{ color: 'rgba(245,236,215,0.85)' }}>{fullText}</p>
          }
        </div>
      )}
      <div className="flex items-start justify-between gap-3 mt-1">
        <div>
          <span className="font-sans text-xs block mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>— {c.source}</span>
          <p className="font-sans text-xs" style={S.hint}>{c.explanation}</p>
        </div>
        <button onClick={handleExpand}
          className="font-sans text-xs whitespace-nowrap shrink-0 transition-colors"
          style={{ color: '#7A9CC0' }}>
          {expanded ? '↑ Less' : '↓ More'}
        </button>
      </div>
    </div>
  )
}

// ── Examples panel (right column) ─────────────────────────────────────────────
function ExamplesPanel({ device, ageGroup }) {
  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [data,     setData]     = useState(null)

  useEffect(() => {
    if (!device) { setData(null); return }
    loadExamples()
  }, [device?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadExamples() {
    setData(null); setLoading(true); setErrorMsg('')
    try {
      const [gutenbergPassages, generatedRaw] = await Promise.all([
        fetchGutenbergPassages(device.name, ageGroup),
        claudeChat({
          system: 'Return ONLY valid JSON, no markdown. Structure: {"generated":[{"text":"...","explanation":"..."}]}',
          messages: [{ role: 'user', content:
            `Give 3 original creative examples of "${device.name}" (${device.def}) for students aged ${ageGroup}. Each: vivid, memorable 1–2 sentences.`
          }],
        })
      ])
      const gen = JSON.parse(generatedRaw.replace(/```json|```/g, '').trim())
      setData({ classic: gutenbergPassages, generated: gen.generated || [] })
    } catch(e) { setErrorMsg(e.message || 'Failed to load examples.') }
    setLoading(false)
  }

  if (!device) return (
    <div className="flex flex-col items-center justify-center gap-3 p-8"
      style={{ border: '1px solid #1A3358', minHeight: '400px' }}>
      <span className="text-4xl opacity-20">📖</span>
      <p className="font-sans text-xs text-center" style={S.hint}>
        Tap any card to flip it open<br />and see examples here
      </p>
    </div>
  )

  return (
    <div className="fade-up flex flex-col" style={{ height: '100%' }}>
      <div className="p-4 shrink-0 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, #112040, ${device.hue}33)`,
          border: `1px solid ${device.accent}44`,
          borderBottom: '0',
        }}>
        <span className="text-2xl">{device.emoji}</span>
        <div>
          <h3 className="font-serif text-lg leading-tight" style={S.page}>{device.name}</h3>
          <p className="font-sans text-xs mt-0.5" style={{ color: device.accent }}>{device.def}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ border: `1px solid ${device.accent}33` }}>
        {loading && (
          <div className="p-8 flex flex-col items-center gap-2">
            <p className="font-sans text-xs tracking-widest uppercase" style={S.hint}>Finding examples...</p>
            <p className="font-sans text-xs" style={{ color: 'rgba(138,122,104,0.5)' }}>Pulling passages from classic literature</p>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 font-sans text-xs m-4"
            style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
            {errorMsg}
          </div>
        )}
        {data && (
          <div className="p-4 space-y-5">
            <div>
              <p className="font-sans text-xs tracking-widest uppercase mb-3" style={S.label}>Examples</p>
              <div className="space-y-3">
                {data.generated.map((g, i) => (
                  <div key={i} className="pl-3" style={{ borderLeft: `2px solid ${device.hue}88` }}>
                    <p className="font-serif text-sm italic mb-1" style={S.page}>"{g.text}"</p>
                    <p className="font-sans text-xs" style={S.body}>{g.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-sans text-xs tracking-widest uppercase mb-3" style={S.label}>From Classic Literature</p>
              <div className="space-y-3">
                {data.classic.map((c, i) => (
                  <ClassicCard key={i} c={c} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Custom device panel ────────────────────────────────────────────────────────
function CustomDevicePanel({ ageGroup }) {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  async function handleLookup() {
    if (!input.trim()) return
    setLoading(true); setResult(null); setError('')
    try {
      const raw = await claudeChat({
        system: 'Return ONLY valid JSON, no markdown. Structure: {"name":"...","definition":"...","examples":[{"text":"...","explanation":"..."}],"tip":"..."}',
        messages: [{ role: 'user', content:
          `The student has asked about the literary device: "${input.trim()}". For students aged ${ageGroup}, provide:
- name: the proper name
- definition: a clear one-sentence definition
- examples: 4 vivid original examples (text + explanation each)
- tip: one practical tip for using it in their own writing`
        }]
      })
      setResult(JSON.parse(raw.replace(/```json|```/g, '').trim()))
    } catch(e) { setError(e.message || 'Could not look up that device.') }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 shrink-0"
        style={{ background: 'linear-gradient(135deg,#112040,#0B1628)', border: '1px solid #1A3358', borderBottom: '0' }}>
        <p className="font-sans text-xs tracking-widest uppercase mb-1" style={S.label}>Your Own Device</p>
        <p className="font-sans text-xs" style={S.body}>Type any literary term and Claude will explain it.</p>
      </div>
      <div className="p-4 shrink-0 flex gap-2" style={{ border: '1px solid #1A3358', borderBottom: '0' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          placeholder="e.g. chiasmus, zeugma..."
          className="flex-1 font-sans text-xs p-2.5 focus:outline-none" style={S.input} />
        <button onClick={handleLookup} disabled={loading || !input.trim()}
          className="font-sans text-xs tracking-widest uppercase px-4 py-2.5 font-bold transition-colors disabled:opacity-40"
          style={{ background: '#D4AF37', color: '#0B1628' }}>
          {loading ? '...' : 'Look up →'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ border: '1px solid #1A3358' }}>
        {error && <div className="p-3 font-sans text-xs m-4" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>{error}</div>}
        {result && (
          <div className="p-4 space-y-4 fade-up">
            <div className="p-4" style={{ background: 'rgba(26,51,88,0.4)', border: '1px solid #2A4A6B' }}>
              <h3 className="font-serif text-lg mb-1" style={S.page}>{result.name}</h3>
              <p className="font-sans text-xs" style={S.label}>{result.definition}</p>
            </div>
            <div className="space-y-3">
              {(result.examples || []).map((ex, i) => (
                <div key={i} className="pl-3" style={{ borderLeft: '2px solid #1F3A5F' }}>
                  <p className="font-serif text-sm italic mb-1" style={S.page}>"{ex.text}"</p>
                  <p className="font-sans text-xs" style={S.body}>{ex.explanation}</p>
                </div>
              ))}
            </div>
            {result.tip && (
              <div className="p-3 flex gap-2" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <span style={S.label}>✦</span>
                <p className="font-sans text-xs leading-relaxed" style={S.body}>
                  <span style={S.label}>Writing tip: </span>{result.tip}
                </p>
              </div>
            )}
          </div>
        )}
        {!result && !error && !loading && (
          <div className="p-8 flex items-center justify-center">
            <p className="font-sans text-xs" style={S.hint}>Enter a device name above</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function LiteraryDevices() {
  const { ageGroup } = useApp()
  const [search,   setSearch]   = useState('')
  const [active,   setActive]   = useState(null)

  const filtered = DEVICES.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.def.toLowerCase().includes(search.toLowerCase())
  )

  function handleToggle(device) {
    setActive(prev => prev?.name === device.name ? null : device)
  }

  const selectedDevice = active && active !== 'custom' ? active : null

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="mb-6">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 03</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Literary Devices</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>
          Tap a card to flip it open and explore examples. Tap again to close.
        </p>
      </div>

      {/* Search + custom toggle */}
      <div className="flex gap-2 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search devices..."
          className="flex-1 font-sans text-xs p-3 focus:outline-none" style={S.input} />
        <button
          onClick={() => setActive(a => a === 'custom' ? null : 'custom')}
          className="font-sans text-xs tracking-widest uppercase px-4 py-3 transition-all"
          style={active === 'custom'
            ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }
            : { border: '1px solid #1A3358', color: '#C8B99A' }
          }>
          ✦ Your own device
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ alignItems: 'start' }}>

        {/* Left: card grid — with atmospheric backdrop */}
        <div
          className="overflow-y-auto p-4"
          style={{
            maxHeight: '75vh',
            background: 'linear-gradient(160deg, rgba(11,22,40,0.9) 0%, rgba(17,32,64,0.5) 100%)',
            border: '1px solid #1A3358',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)',
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(d => (
              <FlashCard
                key={d.name}
                device={d}
                isActive={active?.name === d.name}
                onToggle={() => handleToggle(d)}
              />
            ))}
          </div>
        </div>

        {/* Right: sticky panel */}
        <div style={{ position: 'sticky', top: '1rem', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
          {active === 'custom'
            ? <CustomDevicePanel ageGroup={ageGroup} />
            : <ExamplesPanel device={selectedDevice} ageGroup={ageGroup} />
          }
        </div>
      </div>
    </div>
  )
}
