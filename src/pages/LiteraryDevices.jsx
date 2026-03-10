import { useState } from 'react'
import { useApp } from '../context/AppContext'

const DEVICES = [
  { name: 'Simile', def: 'A comparison using "like" or "as"', emoji: '🌸' },
  { name: 'Metaphor', def: 'A direct comparison without "like" or "as"', emoji: '🌻' },
  { name: 'Personification', def: 'Giving human qualities to non-human things', emoji: '🪻' },
  { name: 'Alliteration', def: 'Repetition of the same initial consonant sound', emoji: '🌷' },
  { name: 'Onomatopoeia', def: 'Words that sound like what they describe', emoji: '🥐' },
  { name: 'Hyperbole', def: 'Extreme exaggeration for effect', emoji: '🍰' },
  { name: 'Idiom', def: 'A phrase with a figurative meaning different from its literal one', emoji: '🍩' },
  { name: 'Imagery', def: 'Language that appeals to the senses', emoji: '🌹' },
  { name: 'Irony', def: 'When the opposite of what is expected occurs', emoji: '🐝' },
  { name: 'Symbolism', def: 'Using an object or action to represent something else', emoji: '🦋' },
  { name: 'Foreshadowing', def: 'Hints at future events in the story', emoji: '🍜' },
  { name: 'Flashback', def: 'A scene set in an earlier time than the main story', emoji: '🐠' },
  { name: 'Dialogue', def: 'Conversation between characters', emoji: '🧁' },
  { name: 'Oxymoron', def: 'Two contradictory terms used together', emoji: '🦊' },
  { name: 'Allusion', def: 'A reference to a well-known person, place or event', emoji: '🦚' },
  { name: 'Anaphora', def: 'Repetition of a word or phrase at the start of successive clauses', emoji: '🌺' },
  { name: 'Juxtaposition', def: 'Placing two contrasting things side by side', emoji: '🐠' },
  { name: 'Assonance', def: 'Repetition of vowel sounds in nearby words', emoji: '🌿' },
  { name: 'Euphemism', def: 'A mild word substituted for one that might seem harsh', emoji: '🍃' },
  { name: 'Allegory', def: 'A story with a hidden meaning, often moral or political', emoji: '🌾' },
  { name: 'Motif', def: 'A recurring element that has symbolic significance', emoji: '🪷' },
  { name: 'Paradox', def: 'A statement that seems contradictory but contains a truth', emoji: '🌙' },
  { name: 'Extended Metaphor', def: 'A metaphor sustained throughout a passage or work', emoji: '🦚' },
  { name: 'Stream of Consciousness', def: 'Writing that depicts the uninterrupted flow of thoughts', emoji: '🌊' },
  { name: 'Tone', def: 'The author\'s attitude toward the subject or audience', emoji: '🎵' },
  { name: 'Mood', def: 'The atmosphere or emotional feeling of a piece', emoji: '🌅' },
  { name: 'Understatement', def: 'Deliberately making something seem less than it is', emoji: '🤫' },
  { name: 'Sarcasm', def: 'A form of irony intended to mock or show contempt', emoji: '😏' },
  { name: 'Point of View', def: 'The perspective from which a story is narrated', emoji: '👁️' },
  { name: 'Flashforward', def: 'A scene set in a future time from the main narrative', emoji: '⏩' },
]

export default function LiteraryDevices() {
  const { ageGroup } = useApp()
  const [selected, setSelected] = useState(null)
  const [examples, setExamples] = useState({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = DEVICES.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.def.toLowerCase().includes(search.toLowerCase())
  )

  async function loadExamples(device) {
    if (examples[device.name]) { setSelected(device); return }
    setSelected(device)
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Return ONLY valid JSON, no markdown. Use this exact structure: {"generated": [{"text": "example sentence", "explanation": "why this is the device"}], "classic": [{"text": "3-5 line passage", "source": "Author, Title", "link": "gutenberg url or empty string", "explanation": "brief analysis"}]}',
          messages: [{
            role: 'user',
            content: `Give me 3 generated examples and 3 classic literature examples of the literary device "${device.name}" (${device.def}), appropriate for students aged ${ageGroup}.`
          }]
        })
      })
      const data = await res.json()
      const raw = data.content.map(i => i.text || '').join('')
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setExamples(prev => ({ ...prev, [device.name]: parsed }))
    } catch { setExamples(prev => ({ ...prev, [device.name]: { error: true } })) }
    setLoading(false)
  }

  const ex = selected ? examples[selected.name] : null

  return (
    <div className="fade-up">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest text-gold uppercase mb-2">Module 03</p>
        <h2 className="font-serif text-3xl text-silver mb-2">Literary Devices</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm text-g600">Explore every major literary device. See AI-generated examples and passages from classic English literature.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Device list */}
        <div className="lg:col-span-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search devices..."
            className="w-full bg-g800/50 border border-g800 text-silver font-sans text-xs p-3 mb-3 focus:outline-none focus:border-gold/50 placeholder-g700"
          />
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(d => (
              <button
                key={d.name}
                onClick={() => loadExamples(d)}
                className={`w-full text-left border px-4 py-3 transition-all flex items-center gap-3 ${
                  selected?.name === d.name
                    ? 'border-gold bg-gold/5 text-gold'
                    : 'border-g800 text-silver hover:border-g700'
                }`}
              >
                <span className="text-lg">{d.emoji}</span>
                <div>
                  <div className="font-serif text-sm">{d.name}</div>
                  <div className="font-sans text-xs text-g600 leading-tight mt-0.5">{d.def.substring(0, 40)}...</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Examples panel */}
        <div className="lg:col-span-2">
          {!selected && (
            <div className="border border-dashed border-g800 h-64 flex items-center justify-center">
              <p className="font-sans text-xs text-g700 tracking-widest uppercase">Select a device to explore examples</p>
            </div>
          )}

          {selected && (
            <div className="fade-up">
              <div className="border border-g800 p-5 mb-4" style={{background:'linear-gradient(135deg,#1a2332,#111827)'}}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{selected.emoji}</span>
                  <div>
                    <h3 className="font-serif text-2xl text-silver">{selected.name}</h3>
                    <p className="font-sans text-xs text-gold">{selected.def}</p>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="border border-g800 p-6 text-center">
                  <p className="font-sans text-xs text-g600 tracking-widest uppercase">Loading examples...</p>
                </div>
              )}

              {ex && !ex.error && (
                <>
                  {/* Generated examples */}
                  <div className="border border-g800 p-5 mb-4">
                    <p className="font-sans text-xs text-gold tracking-widest uppercase mb-3">Generated Examples</p>
                    <div className="space-y-3">
                      {(ex.generated || []).map((g, i) => (
                        <div key={i} className="border-l-2 border-oxford pl-4">
                          <p className="font-serif text-sm text-silver italic mb-1">"{g.text}"</p>
                          <p className="font-sans text-xs text-g600">{g.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classic literature examples */}
                  <div className="border border-g800 p-5">
                    <p className="font-sans text-xs text-gold tracking-widest uppercase mb-3">From Classic Literature</p>
                    <div className="space-y-4">
                      {(ex.classic || []).map((c, i) => (
                        <div key={i} className="bg-g800/30 border border-g800 p-4">
                          <p className="font-serif text-sm text-silver/80 italic leading-relaxed mb-2">{c.text}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-xs text-gold/60">— {c.source}</span>
                            {c.link && (
                              <a href={c.link} target="_blank" rel="noreferrer"
                                 className="font-sans text-xs text-g600 hover:text-gold transition-colors">
                                Read on Gutenberg →
                              </a>
                            )}
                          </div>
                          <p className="font-sans text-xs text-g700 mt-2">{c.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {ex?.error && (
                <div className="border border-g800 p-4 text-g600 font-sans text-sm">Failed to load examples. Please try again.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
