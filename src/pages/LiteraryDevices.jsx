import { useState, useRef } from 'react'
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
function FlashCard({ device, isSelected, onExplore }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      className="cursor-pointer select-none"
      style={{ perspective: '800px', height: '140px' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — name + emoji */}
        <div
          style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: isSelected ? 'rgba(212,175,55,0.08)' : 'linear-gradient(135deg,#112040,#0B1628)',
            border: isSelected ? '1px solid #D4AF37' : '1px solid #1A3358',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px',
          }}
        >
          <span style={{ fontSize: '28px' }}>{device.emoji}</span>
          <span className="font-serif text-sm text-center" style={isSelected ? S.label : S.page}>{device.name}</span>
          <span className="font-sans text-xs" style={{ color: 'rgba(138,122,104,0.7)' }}>tap to flip</span>
        </div>

        {/* Back — definition + explore button */}
        <div
          style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg,#1A3358,#112040)',
            border: '1px solid #2A4A6B',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 12px 10px',
          }}
        >
          <p className="font-sans text-xs text-center leading-relaxed" style={S.body}>{device.def}</p>
          <button
            onClick={e => { e.stopPropagation(); onExplore(device) }}
            className="font-sans text-xs tracking-widest uppercase px-3 py-1.5 transition-colors"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}
          >
            Explore examples →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Classic passage card with expandable context ───────────────────────────────
function ClassicCard({ c, deviceName }) {
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
        messages: [{
          role: 'user',
          content: `Extend the following passage from "${c.source}" by adding the sentences that come immediately before and after it in the original text. Passage:\n\n"${c.text}"\n\nReturn only the extended passage, no preamble. Around 10–15 lines.`
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
          {expanded ? '↑ Less' : '↓ More context'}
        </button>
      </div>
    </div>
  )
}

// ── Examples panel ─────────────────────────────────────────────────────────────
function ExamplesPanel({ device, ageGroup, cache, setCache }) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const data = cache[device.name]

  // Auto-load on mount if not cached
  useState(() => {
    if (data) return
    loadExamples()
  })

  async function loadExamples() {
    if (cache[device.name]) return
    setLoading(true); setErrorMsg('')
    try {
      const [gutenbergPassages, generatedRaw] = await Promise.all([
        fetchGutenbergPassages(device.name, ageGroup),
        claudeChat({
          system: 'Return ONLY valid JSON, no markdown. Structure: {"generated":[{"text":"...","explanation":"..."}]}',
          messages: [{ role: 'user', content: `Give 3 original creative examples of "${device.name}" (${device.def}) for students aged ${ageGroup}. Each: vivid, memorable 1–2 sentences.` }],
        })
      ])
      const gen = JSON.parse(generatedRaw.replace(/```json|```/g, '').trim())
      setCache(prev => ({ ...prev, [device.name]: { classic: gutenbergPassages, generated: gen.generated || [] } }))
    } catch(e) { setErrorMsg(e.message || 'Failed to load examples.') }
    setLoading(false)
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="p-5 mb-4 flex items-center justify-between" style={S.card}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{device.emoji}</span>
          <div>
            <h3 className="font-serif text-2xl" style={S.page}>{device.name}</h3>
            <p className="font-sans text-xs mt-0.5" style={S.label}>{device.def}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-8 flex flex-col items-center gap-2" style={S.border}>
          <p className="font-sans text-xs tracking-widest uppercase" style={S.hint}>Fetching from Project Gutenberg...</p>
          <p className="font-sans text-xs" style={{ color: 'rgba(138,122,104,0.5)' }}>Pulling real passages from classic literature</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 font-sans text-sm mb-4" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
          {errorMsg}
        </div>
      )}

      {data && (
        <>
          <div className="p-5 mb-4" style={S.border}>
            <p className="font-sans text-xs tracking-widest uppercase mb-3" style={S.label}>Generated Examples</p>
            <div className="space-y-3">
              {data.generated.map((g, i) => (
                <div key={i} className="pl-4" style={{ borderLeft: '2px solid #1F3A5F' }}>
                  <p className="font-serif text-sm italic mb-1" style={S.page}>"{g.text}"</p>
                  <p className="font-sans text-xs" style={S.body}>{g.explanation}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5" style={S.border}>
            <div className="flex items-center gap-2 mb-3">
              <p className="font-sans text-xs tracking-widest uppercase" style={S.label}>From Classic Literature</p>
              <span className="font-sans text-xs px-2 py-0.5"
                style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                Project Gutenberg
              </span>
            </div>
            <div className="space-y-4">
              {data.classic.map((c, i) => (
                <ClassicCard key={i} c={c} deviceName={device.name} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Custom device panel ─────────────────────────────────────────────────────────
function CustomDevicePanel({ ageGroup }) {
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  async function handleLookup() {
    if (!input.trim()) return
    setLoading(true); setResult(null); setError('')
    try {
      const raw = await claudeChat({
        system: 'Return ONLY valid JSON, no markdown. Structure: {"name":"...","definition":"...","examples":[{"text":"...","explanation":"..."}],"tip":"..."}',
        messages: [{
          role: 'user',
          content: `The student has asked about the literary device or technique: "${input.trim()}". For students aged ${ageGroup}, provide:
- name: the proper name of the device
- definition: a clear one-sentence definition
- examples: 4 vivid original examples (text + explanation each)
- tip: one practical tip for using it in their own writing`
        }]
      })
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setResult(parsed)
    } catch(e) { setError(e.message || 'Could not look up that device.') }
    setLoading(false)
  }

  return (
    <div className="fade-up">
      <div className="p-5 mb-4" style={S.card}>
        <p className="font-sans text-xs tracking-widest uppercase mb-1" style={S.label}>Your Own Device</p>
        <p className="font-sans text-xs" style={S.body}>Type any literary term — familiar or obscure — and Claude will explain and illustrate it.</p>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          placeholder="e.g. chiasmus, zeugma, polysyndeton..."
          className="flex-1 font-sans text-sm p-3 focus:outline-none"
          style={S.input}
        />
        <button
          onClick={handleLookup}
          disabled={loading || !input.trim()}
          className="font-sans text-xs tracking-widest uppercase px-5 py-3 font-bold transition-colors disabled:opacity-40"
          style={{ background: '#D4AF37', color: '#0B1628' }}
        >
          {loading ? '...' : 'Look up →'}
        </button>
      </div>

      {error && <div className="p-3 font-sans text-sm mb-4" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>{error}</div>}

      {result && (
        <div className="fade-up">
          <div className="p-5 mb-4" style={{ background: 'linear-gradient(135deg,#1A3358,#112040)', border: '1px solid #2A4A6B' }}>
            <h3 className="font-serif text-xl mb-1" style={S.page}>{result.name}</h3>
            <p className="font-sans text-xs" style={S.label}>{result.definition}</p>
          </div>
          <div className="p-5 mb-4" style={S.border}>
            <p className="font-sans text-xs tracking-widest uppercase mb-3" style={S.label}>Examples</p>
            <div className="space-y-3">
              {(result.examples || []).map((ex, i) => (
                <div key={i} className="pl-4" style={{ borderLeft: '2px solid #1F3A5F' }}>
                  <p className="font-serif text-sm italic mb-1" style={S.page}>"{ex.text}"</p>
                  <p className="font-sans text-xs" style={S.body}>{ex.explanation}</p>
                </div>
              ))}
            </div>
          </div>
          {result.tip && (
            <div className="p-4 flex gap-3" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <span style={S.label}>✦</span>
              <p className="font-sans text-xs leading-relaxed" style={S.body}><span style={S.label}>Writing tip: </span>{result.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function LiteraryDevices() {
  const { ageGroup } = useApp()
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)   // { name, def, emoji } or 'custom'
  const [cache, setCache]       = useState({})
  const panelRef = useRef(null)

  const filtered = DEVICES.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.def.toLowerCase().includes(search.toLowerCase())
  )

  function handleExplore(device) {
    setSelected(device)
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 03</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Literary Devices</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>
          Flip a card to see the definition, then explore real examples from{' '}
          <span style={S.label}>Project Gutenberg</span>. Or look up any device you like.
        </p>
      </div>

      {/* Search + custom device toggle */}
      <div className="flex gap-2 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search devices..."
          className="flex-1 font-sans text-xs p-3 focus:outline-none"
          style={S.input}
        />
        <button
          onClick={() => setSelected('custom')}
          className="font-sans text-xs tracking-widest uppercase px-4 py-3 transition-all"
          style={selected === 'custom'
            ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }
            : { border: '1px solid #1A3358', color: '#C8B99A' }
          }
        >
          ✦ Your own device
        </button>
      </div>

      {/* Flash card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-10">
        {filtered.map(d => (
          <FlashCard
            key={d.name}
            device={d}
            isSelected={selected?.name === d.name}
            onExplore={handleExplore}
          />
        ))}
      </div>

      {/* Examples / custom panel */}
      {selected && (
        <div ref={panelRef} className="pt-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="gold-bar flex-1" />
            <span className="font-sans text-xs tracking-widest uppercase" style={S.hint}>
              {selected === 'custom' ? 'Custom lookup' : `Examples — ${selected.name}`}
            </span>
            <div className="gold-bar flex-1" />
          </div>

          {selected === 'custom'
            ? <CustomDevicePanel ageGroup={ageGroup} />
            : <ExamplesPanel device={selected} ageGroup={ageGroup} cache={cache} setCache={setCache} />
          }
        </div>
      )}
    </div>
  )
}
