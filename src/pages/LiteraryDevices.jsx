import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'
import { fetchGutenbergPassages } from '../lib/gutenberg'

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

// Classic passage card — real Gutenberg text, expand loads more context
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
          content: `Extend the following passage from "${c.source}" by adding the sentences that come immediately before and after it in the original text, to give more context. The passage is:\n\n"${c.text}"\n\nProvide only the extended passage text — no explanation, no preamble. Keep it to around 10–15 lines.`
        }]
      })
      setFullText(result)
    } catch {
      setFullText('Could not load additional context.')
    }
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
          className="font-sans text-xs whitespace-nowrap transition-colors shrink-0"
          style={{ color: '#7A9CC0' }}>
          {expanded ? '↑ Less context' : '↓ More context'}
        </button>
      </div>
    </div>
  )
}

export default function LiteraryDevices() {
  const { ageGroup } = useApp()
  const [selected, setSelected]     = useState(null)
  const [cache, setCache]           = useState({})   // keyed by device name
  const [loading, setLoading]       = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')
  const [search, setSearch]         = useState('')

  const filtered = DEVICES.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.def.toLowerCase().includes(search.toLowerCase())
  )

  async function selectDevice(device) {
    setSelected(device)
    setErrorMsg('')
    if (cache[device.name]) return  // already loaded

    setLoading(true)
    try {
      // Run both fetches in parallel
      const [gutenbergPassages, generatedRaw] = await Promise.all([
        fetchGutenbergPassages(device.name, ageGroup),
        claudeChat({
          system: 'Return ONLY valid JSON, no markdown. Structure: {"generated":[{"text":"...","explanation":"..."}]}',
          messages: [{ role: 'user', content: `Give 3 original creative examples of "${device.name}" (${device.def}) for students aged ${ageGroup}. Each should be a vivid, memorable 1–2 sentence example.` }],
        })
      ])

      const generatedParsed = JSON.parse(generatedRaw.replace(/```json|```/g, '').trim())
      setCache(prev => ({
        ...prev,
        [device.name]: {
          classic: gutenbergPassages,
          generated: generatedParsed.generated || []
        }
      }))
    } catch(e) {
      setErrorMsg(e.message || 'Failed to load examples.')
    }
    setLoading(false)
  }

  const data = selected ? cache[selected.name] : null

  return (
    <div className="fade-up">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 03</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Literary Devices</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>
          Explore every major literary device with AI-generated examples and real passages pulled from
          <span style={S.label}> Project Gutenberg</span> — the world's largest library of free public domain literature.
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
              <div className="p-5 mb-4" style={S.card}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selected.emoji}</span>
                  <div>
                    <h3 className="font-serif text-2xl" style={S.page}>{selected.name}</h3>
                    <p className="font-sans text-xs" style={S.label}>{selected.def}</p>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="p-8 flex flex-col items-center gap-3" style={S.border}>
                  <p className="font-sans text-xs tracking-widest uppercase" style={S.hint}>Fetching from Project Gutenberg...</p>
                  <p className="font-sans text-xs" style={{ color: 'rgba(138,122,104,0.6)' }}>Pulling real passages from classic literature</p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 font-sans text-sm mb-4" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
                  {errorMsg}
                </div>
              )}

              {data && (
                <>
                  {/* Generated examples */}
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

                  {/* Real Gutenberg passages */}
                  <div className="p-5" style={S.border}>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="font-sans text-xs tracking-widest uppercase" style={S.label}>From Classic Literature</p>
                      <span className="font-sans text-xs px-2 py-0.5" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>Project Gutenberg</span>
                    </div>
                    <div className="space-y-4">
                      {data.classic.map((c, i) => (
                        <ClassicCard key={i} c={c} deviceName={selected.name} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
