import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'
import { fetchGutenbergPassages } from '../lib/gutenberg'

const DEVICES = [
  { name: 'Simile',                   def: 'A comparison using "like" or "as"',                               emoji: '🌸' },
  { name: 'Metaphor',                 def: 'A direct comparison without "like" or "as"',                      emoji: '🌻' },
  { name: 'Personification',          def: 'Giving human qualities to non-human things',                     emoji: '🪻' },
  { name: 'Alliteration',             def: 'Repetition of the same initial consonant sound',                 emoji: '🌷' },
  { name: 'Onomatopoeia',             def: 'Words that sound like what they describe',                       emoji: '🥐' },
  { name: 'Hyperbole',                def: 'Extreme exaggeration for effect',                                emoji: '🍰' },
  { name: 'Idiom',                    def: 'A phrase whose meaning differs from its literal words',          emoji: '🍩' },
  { name: 'Imagery',                  def: 'Language that appeals to the senses',                            emoji: '🌹' },
  { name: 'Irony',                    def: 'When the opposite of what is expected occurs',                   emoji: '🐝' },
  { name: 'Symbolism',                def: 'Using an object or action to represent something else',          emoji: '🦋' },
  { name: 'Foreshadowing',            def: 'Hints at future events in the story',                            emoji: '🍜' },
  { name: 'Flashback',                def: 'A scene set in an earlier time than the main story',             emoji: '🐠' },
  { name: 'Dialogue',                 def: 'Conversation between characters',                                emoji: '🧁' },
  { name: 'Oxymoron',                 def: 'Two contradictory terms used together',                          emoji: '🦊' },
  { name: 'Allusion',                 def: 'A reference to a well-known person, place, or event',            emoji: '🦚' },
  { name: 'Anaphora',                 def: 'Repetition of a word or phrase at the start of successive lines',emoji: '🌺' },
  { name: 'Juxtaposition',            def: 'Placing two contrasting things side by side',                    emoji: '🌿' },
  { name: 'Assonance',                def: 'Repetition of vowel sounds in nearby words',                    emoji: '🍃' },
  { name: 'Euphemism',                def: 'A mild word substituted for one that might seem harsh',          emoji: '🌾' },
  { name: 'Allegory',                 def: 'A story with a hidden meaning, often moral or political',       emoji: '🪷' },
  { name: 'Motif',                    def: 'A recurring element that has symbolic significance',             emoji: '🌙' },
  { name: 'Paradox',                  def: 'A statement that seems contradictory but contains a truth',     emoji: '🌊' },
  { name: 'Extended Metaphor',        def: 'A metaphor sustained throughout a passage or whole work',        emoji: '🦚' },
  { name: 'Stream of Consciousness',  def: 'Writing that depicts the uninterrupted flow of thoughts',       emoji: '🌀' },
  { name: 'Tone',                     def: "The author's attitude toward the subject or audience",           emoji: '🎵' },
  { name: 'Mood',                     def: 'The atmosphere or emotional feeling of a piece',                 emoji: '🌅' },
  { name: 'Understatement',           def: 'Deliberately making something seem less than it is',             emoji: '🤫' },
  { name: 'Sarcasm',                  def: 'A form of irony intended to mock or show contempt',              emoji: '😏' },
  { name: 'Point of View',            def: 'The perspective from which a story is narrated',                emoji: '👁️' },
  { name: 'Flashforward',             def: 'A scene set in a future time from the main narrative',           emoji: '⏩' },
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
// flippedName is the name of the card currently showing its back (controlled externally)
function FlashCard({ device, isSelected, flippedName, onFlip, onExplore }) {
  const flipped = flippedName === device.name

  return (
    <div
      onClick={() => onFlip(device.name)}
      className="cursor-pointer select-none"
      style={{ perspective: '800px', height: '140px' }}
    >
      <div
        style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          background: isSelected ? 'rgba(212,175,55,0.08)' : 'linear-gradient(135deg,#112040,#0B1628)',
          border: isSelected ? '1px solid #D4AF37' : '1px solid #1A3358',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
        }}>
          <span style={{ fontSize: '28px' }}>{device.emoji}</span>
          <span className="font-serif text-sm text-center" style={isSelected ? S.label : S.page}>{device.name}</span>
          <span className="font-sans text-xs" style={{ color: 'rgba(138,122,104,0.7)' }}>tap to flip</span>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg,#1A3358,#112040)',
          border: '1px solid #2A4A6B',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 12px 10px',
        }}>
          <p className="font-sans text-xs text-center leading-relaxed" style={S.body}>{device.def}</p>
          <div className="flex gap-2 w-full justify-center">
            <button
              onClick={e => { e.stopPropagation(); onExplore(device) }}
              className="font-sans text-xs tracking-widest uppercase px-3 py-1.5 transition-colors"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}
            >
              Examples →
            </button>
            <button
              onClick={e => { e.stopPropagation(); onFlip(device.name) }}
              className="font-sans text-xs px-2 py-1.5 transition-colors"
              style={{ color: '#8A7A68', border: '1px solid #1A3358' }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Classic passage card ───────────────────────────────────────────────────────
function ClassicCard({ c }) {
  const [expanded, setExpanded] = useState(false)
  const [fullText, setFullText] = useState('')
  const [loading, setLoading]   = useState(false)

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
function ExamplesPanel({ device, ageGroup, cache, setCache }) {
  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const data = cache[device?.name]

  useEffect(() => {
    if (!device) return
    if (cache[device.name]) return
    loadExamples()
  }, [device?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadExamples() {
    setLoading(true); setErrorMsg('')
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
      setCache(prev => ({ ...prev, [device.name]: { classic: gutenbergPassages, generated: gen.generated || [] } }))
    } catch(e) { setErrorMsg(e.message || 'Failed to load examples.') }
    setLoading(false)
  }

  // Empty state
  if (!device) return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-8"
      style={{ border: '1px solid #1A3358', minHeight: '400px' }}>
      <span className="text-4xl opacity-20">📖</span>
      <p className="font-sans text-xs text-center" style={S.hint}>
        Flip a card and tap<br /><span style={S.label}>Examples →</span> to see passages here
      </p>
    </div>
  )

  return (
    <div className="fade-up flex flex-col" style={{ height: '100%' }}>
      {/* Sticky header */}
      <div className="p-4 shrink-0 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg,#112040,#0B1628)', border: '1px solid #1A3358', borderBottom: '0' }}>
        <span className="text-2xl">{device.emoji}</span>
        <div>
          <h3 className="font-serif text-lg leading-tight" style={S.page}>{device.name}</h3>
          <p className="font-sans text-xs mt-0.5" style={S.label}>{device.def}</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ border: '1px solid #1A3358' }}>
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
            {/* Generated examples */}
            <div>
              <p className="font-sans text-xs tracking-widest uppercase mb-3" style={S.label}>Examples</p>
              <div className="space-y-3">
                {data.generated.map((g, i) => (
                  <div key={i} className="pl-3" style={{ borderLeft: '2px solid #1F3A5F' }}>
                    <p className="font-serif text-sm italic mb-1" style={S.page}>"{g.text}"</p>
                    <p className="font-sans text-xs" style={S.body}>{g.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Classic passages */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="font-sans text-xs tracking-widest uppercase" style={S.label}>From Classic Literature</p>
              </div>
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
  const [selected, setSelected] = useState(null)   // device object or 'custom'
  const [flipped,  setFlipped]  = useState(null)   // name of currently flipped card
  const [cache,    setCache]    = useState({})

  const filtered = DEVICES.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.def.toLowerCase().includes(search.toLowerCase())
  )

  function handleFlip(name) {
    // Toggle: flip this card, or flip back if already showing
    setFlipped(f => f === name ? null : name)
  }

  function handleExplore(device) {
    setSelected(device)
    // Flip this card back to front now that we're showing examples
    setFlipped(null)
  }

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="mb-6">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 03</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Literary Devices</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>
          Flip a card to see its definition, tap <span style={S.label}>Examples →</span> to explore passages alongside the cards.
        </p>
      </div>

      {/* Search + custom toggle */}
      <div className="flex gap-2 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search devices..."
          className="flex-1 font-sans text-xs p-3 focus:outline-none" style={S.input} />
        <button
          onClick={() => { setSelected('custom'); setFlipped(null) }}
          className="font-sans text-xs tracking-widest uppercase px-4 py-3 transition-all"
          style={selected === 'custom'
            ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }
            : { border: '1px solid #1A3358', color: '#C8B99A' }
          }>
          ✦ Your own device
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ alignItems: 'start' }}>

        {/* Left: scrollable card grid */}
        <div className="overflow-y-auto" style={{ maxHeight: '75vh' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
            {filtered.map(d => (
              <FlashCard
                key={d.name}
                device={d}
                isSelected={selected?.name === d.name}
                flippedName={flipped}
                onFlip={handleFlip}
                onExplore={handleExplore}
              />
            ))}
          </div>
        </div>

        {/* Right: sticky examples panel */}
        <div style={{ position: 'sticky', top: '1rem', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
          {selected === 'custom'
            ? <CustomDevicePanel ageGroup={ageGroup} />
            : <ExamplesPanel
                device={selected}
                ageGroup={ageGroup}
                cache={cache}
                setCache={setCache}
              />
          }
        </div>
      </div>
    </div>
  )
}
