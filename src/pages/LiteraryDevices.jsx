import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'
import { DEVICE_SOURCES, fetchGutenbergPassage } from '../lib/gutenberg'

const DEVICES = [
  { name:'Simile',              def:'A comparison using "like" or "as"',                              emoji:'🌸' },
  { name:'Metaphor',            def:'A direct comparison without "like" or "as"',                     emoji:'🌻' },
  { name:'Personification',     def:'Giving human qualities to non-human things',                    emoji:'🪻' },
  { name:'Alliteration',        def:'Repetition of the same initial consonant sound',                emoji:'🌷' },
  { name:'Onomatopoeia',        def:'Words that sound like what they describe',                      emoji:'🥐' },
  { name:'Hyperbole',           def:'Extreme exaggeration for effect',                               emoji:'🍰' },
  { name:'Idiom',               def:'A phrase with a figurative meaning different from its literal', emoji:'🍩' },
  { name:'Imagery',             def:'Language that appeals to the senses',                           emoji:'🌹' },
  { name:'Irony',               def:'When the opposite of what is expected occurs',                  emoji:'🐝' },
  { name:'Symbolism',           def:'Using an object or action to represent something else',         emoji:'🦋' },
  { name:'Foreshadowing',       def:'Hints at future events in the story',                           emoji:'🍜' },
  { name:'Flashback',           def:'A scene set in an earlier time than the main story',            emoji:'🐠' },
  { name:'Dialogue',            def:'Conversation between characters',                               emoji:'🧁' },
  { name:'Oxymoron',            def:'Two contradictory terms used together',                         emoji:'🦊' },
  { name:'Allusion',            def:'A reference to a well-known person, place or event',            emoji:'🦚' },
  { name:'Anaphora',            def:'Repetition of a word/phrase at the start of successive clauses',emoji:'🌺' },
  { name:'Juxtaposition',       def:'Placing two contrasting things side by side',                   emoji:'🌿' },
  { name:'Assonance',           def:'Repetition of vowel sounds in nearby words',                   emoji:'🍃' },
  { name:'Euphemism',           def:'A mild word substituted for one that might seem harsh',         emoji:'🌾' },
  { name:'Allegory',            def:'A story with a hidden meaning, often moral or political',      emoji:'🪷' },
  { name:'Motif',               def:'A recurring element that has symbolic significance',            emoji:'🌙' },
  { name:'Paradox',             def:'A statement that seems contradictory but contains a truth',    emoji:'🌊' },
  { name:'Extended Metaphor',   def:'A metaphor sustained throughout a passage or work',             emoji:'🦚' },
  { name:'Stream of Consciousness', def:'Writing that depicts the uninterrupted flow of thoughts',  emoji:'🌊' },
  { name:'Tone',                def:"The author's attitude toward the subject or audience",          emoji:'🎵' },
  { name:'Mood',                def:'The atmosphere or emotional feeling of a piece',                emoji:'🌅' },
  { name:'Understatement',      def:'Deliberately making something seem less than it is',            emoji:'🤫' },
  { name:'Sarcasm',             def:'A form of irony intended to mock or show contempt',             emoji:'😏' },
  { name:'Point of View',       def:'The perspective from which a story is narrated',               emoji:'👁️' },
  { name:'Flashforward',        def:'A scene set in a future time from the main narrative',          emoji:'⏩' },
]

const S = {
  page:  { color: '#F5ECD7' },
  label: { color: '#D4AF37' },
  body:  { color: '#C8B99A' },
  hint:  { color: '#8A7A68' },
  border:{ border: '1px solid #1A3358' },
  card:  { background: 'linear-gradient(135deg,#112040,#0B1628)', border: '1px solid #1A3358' },
  input: { background: 'rgba(17,32,64,0.6)', border: '1px solid #1A3358', color: '#F5ECD7' },
}

// A single classic passage card — text sourced live from Gutenberg
function ClassicCard({ deviceName, deviceDef, sourceKey }) {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [data, setData]   = useState(null)   // { passage, explanation, bookTitle, author, expanded }

  async function load() {
    if (state === 'loading') return
    if (state === 'done') {
      setData(d => ({ ...d, expanded: !d.expanded }))
      return
    }
    setState('loading')
    try {
      // 1. Fetch raw text from Gutenberg
      const { rawText, bookTitle, author } = await fetchGutenbergPassage(deviceName, sourceKey)

      // 2. Ask Claude to find + extract a passage demonstrating the device
      const result = await claudeChat({
        system: 'Return ONLY valid JSON. No markdown. Structure: {"passage":"...","explanation":"..."}',
        messages: [{
          role: 'user',
          content: `From the following text excerpt, find a passage (3–8 sentences) that clearly demonstrates the literary device "${deviceName}" (${deviceDef}). Extract the passage exactly as written, then write a one-sentence explanation of how it demonstrates the device.\n\nText:\n${rawText}`
        }]
      })

      const parsed = JSON.parse(result.replace(/```json|```/g, '').trim())
      setData({
        passage:     parsed.passage,
        explanation: parsed.explanation,
        bookTitle,
        author,
        expanded: false,
      })
      setState('done')
    } catch(e) {
      console.error(e)
      setState('error')
    }
  }

  const bookLabels = {
    shakespeare:  'Shakespeare — Complete Works',
    austen_pp:    'Jane Austen — Pride and Prejudice',
    dickens_ttc:  'Charles Dickens — A Tale of Two Cities',
    dickens_gc:   'Charles Dickens — Great Expectations',
    hardy_tess:   'Thomas Hardy — Tess of the d\'Urbervilles',
    eliot_mm:     'George Eliot — Middlemarch',
    poe:          'Edgar Allan Poe — Selected Works',
    keats:        'John Keats — Poems',
    bronte_je:    'Charlotte Brontë — Jane Eyre',
    hardy_rn:     'Thomas Hardy — The Return of the Native',
    shelley_fr:   'Mary Shelley — Frankenstein',
    swift_gt:     "Jonathan Swift — Gulliver's Travels",
    defoe_rc:     'Daniel Defoe — Robinson Crusoe',
    bunyan:       "John Bunyan — The Pilgrim's Progress",
    homer_iliad:  'Homer — The Iliad',
  }

  return (
    <div className="p-4" style={{ background: 'rgba(17,32,64,0.4)', border: '1px solid #1A3358' }}>

      {/* Book label + load button when idle */}
      {state === 'idle' && (
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs" style={S.hint}>{bookLabels[sourceKey]}</span>
          <button onClick={load}
            className="font-sans text-xs whitespace-nowrap transition-colors"
            style={{ color: '#7A9CC0' }}>
            Load passage →
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs" style={S.hint}>{bookLabels[sourceKey]}</span>
          <span className="font-sans text-xs italic" style={{ color: '#4A6A8A' }}>Fetching from Gutenberg...</span>
        </div>
      )}

      {state === 'error' && (
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs" style={{ color: '#f87171' }}>Failed to load — {bookLabels[sourceKey]}</span>
          <button onClick={() => { setState('idle') }}
            className="font-sans text-xs" style={{ color: '#7A9CC0' }}>Retry</button>
        </div>
      )}

      {state === 'done' && data && (
        <>
          {/* Always show: short passage preview (first 200 chars) */}
          <p className="font-serif text-sm italic leading-relaxed mb-3"
            style={{ color: 'rgba(245,236,215,0.8)' }}>
            {data.expanded ? data.passage : `${data.passage.slice(0, 220)}${data.passage.length > 220 ? '…' : ''}`}
          </p>

          {/* Source + explanation + expand toggle */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-sans text-xs block mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>
                — {data.bookTitle}{data.author ? `, ${data.author}` : ''}
              </span>
              <p className="font-sans text-xs" style={S.hint}>{data.explanation}</p>
            </div>
            {data.passage.length > 220 && (
              <button
                onClick={() => setData(d => ({ ...d, expanded: !d.expanded }))}
                className="font-sans text-xs whitespace-nowrap shrink-0 transition-colors"
                style={{ color: '#7A9CC0' }}>
                {data.expanded ? '↑ Show less' : '↓ Read more'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function LiteraryDevices() {
  const { ageGroup } = useApp()
  const [selected, setSelected]     = useState(null)
  const [generated, setGenerated]   = useState({})
  const [genLoading, setGenLoading] = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')
  const [search, setSearch]         = useState('')

  const filtered = DEVICES.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.def.toLowerCase().includes(search.toLowerCase())
  )

  async function selectDevice(device) {
    setSelected(device)
    setErrorMsg('')
    if (generated[device.name]) return
    setGenLoading(true)
    try {
      const raw = await claudeChat({
        system: 'Return ONLY valid JSON, no markdown. Structure: {"generated":[{"text":"...","explanation":"..."}]}',
        messages: [{ role: 'user', content: `Give 3 original creative examples of the literary device "${device.name}" (${device.def}) suitable for students aged ${ageGroup}. Each should be a vivid sentence or two.` }],
      })
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setGenerated(prev => ({ ...prev, [device.name]: parsed.generated || [] }))
    } catch(e) {
      setErrorMsg(e.message || 'Failed to load examples.')
      setGenerated(prev => ({ ...prev, [device.name]: [] }))
    }
    setGenLoading(false)
  }

  const sources = selected ? (DEVICE_SOURCES[selected.name] || []) : []
  const generatedExamples = selected ? (generated[selected.name] || null) : null

  return (
    <div className="fade-up">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 03</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Literary Devices</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>
          Explore every major literary device with AI-generated examples and real passages fetched live from{' '}
          <span style={S.label}>Project Gutenberg</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Device list */}
        <div className="lg:col-span-1">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices..."
            className="w-full font-sans text-xs p-3 mb-3 focus:outline-none" style={S.input} />
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(d => (
              <button key={d.name} onClick={() => selectDevice(d)}
                className="w-full text-left px-4 py-3 transition-all flex items-center gap-3"
                style={selected?.name === d.name
                  ? { border: '1px solid #D4AF37', background: 'rgba(212,175,55,0.05)', color: '#D4AF37' }
                  : { border: '1px solid #1A3358', color: '#F5ECD7' }}>
                <span className="text-lg">{d.emoji}</span>
                <div>
                  <div className="font-serif text-sm">{d.name}</div>
                  <div className="font-sans text-xs leading-tight mt-0.5" style={S.body}>{d.def.substring(0, 42)}...</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Examples panel */}
        <div className="lg:col-span-2">
          {!selected && (
            <div className="h-64 flex items-center justify-center" style={{ border: '1px dashed #1A3358' }}>
              <p className="font-sans text-xs tracking-widest uppercase" style={S.hint}>Select a device to explore examples</p>
            </div>
          )}

          {selected && (
            <div className="fade-up">

              {/* Device header */}
              <div className="p-5 mb-4" style={S.card}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selected.emoji}</span>
                  <div>
                    <h3 className="font-serif text-2xl" style={S.page}>{selected.name}</h3>
                    <p className="font-sans text-xs" style={S.label}>{selected.def}</p>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 font-sans text-sm mb-4"
                  style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
                  {errorMsg}
                </div>
              )}

              {/* AI-generated examples */}
              <div className="p-5 mb-4" style={S.border}>
                <p className="font-sans text-xs tracking-widest uppercase mb-3" style={S.label}>Generated Examples</p>
                {genLoading ? (
                  <p className="font-sans text-xs italic" style={S.hint}>Generating examples...</p>
                ) : generatedExamples?.length > 0 ? (
                  <div className="space-y-3">
                    {generatedExamples.map((g, i) => (
                      <div key={i} className="pl-4" style={{ borderLeft: '2px solid #1F3A5F' }}>
                        <p className="font-serif text-sm italic mb-1" style={S.page}>"{g.text}"</p>
                        <p className="font-sans text-xs" style={S.body}>{g.explanation}</p>
                      </div>
                    ))}
                  </div>
                ) : !genLoading && (
                  <p className="font-sans text-xs italic" style={S.hint}>No examples available.</p>
                )}
              </div>

              {/* Live Gutenberg passages — lazy loaded per card */}
              <div className="p-5" style={S.border}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-sans text-xs tracking-widest uppercase" style={S.label}>From Classic Literature</p>
                </div>
                <p className="font-sans text-xs mb-4" style={S.hint}>
                  Passages fetched live from Project Gutenberg — click "Load passage" to retrieve each one.
                </p>
                <div className="space-y-3">
                  {sources.map((sourceKey) => (
                    <ClassicCard
                      key={`${selected.name}-${sourceKey}`}
                      deviceName={selected.name}
                      deviceDef={selected.def}
                      sourceKey={sourceKey}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
