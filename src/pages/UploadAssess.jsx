import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

const LITERARY_DEVICES = [
  'Simile', 'Metaphor', 'Personification', 'Alliteration', 'Assonance',
  'Onomatopoeia', 'Hyperbole', 'Understatement', 'Irony', 'Sarcasm',
  'Oxymoron', 'Paradox', 'Symbolism', 'Imagery', 'Foreshadowing',
  'Flashback', 'Dialogue', 'Idiom', 'Euphemism', 'Allegory',
  'Allusion', 'Anaphora', 'Juxtaposition', 'Motif', 'Theme',
  'Tone', 'Mood', 'Point of View', 'Extended Metaphor', 'Stream of Consciousness'
]

const QUALITY_DIMENSIONS = [
  { key: 'structure', label: 'Story Structure', desc: 'Clear beginning, middle and end' },
  { key: 'emotion', label: 'Emotional Depth', desc: 'How well feelings are conveyed' },
  { key: 'creativity', label: 'Creativity', desc: 'Originality and imagination' },
  { key: 'vocabulary', label: 'Vocabulary', desc: 'Range and appropriateness of words' },
  { key: 'devices', label: 'Literary Devices', desc: 'Use of techniques' },
]

export default function UploadAssess() {
  const { ageGroup, earnBadge, addAssessment } = useApp()
  const [mode, setMode] = useState('type') // 'type' | 'photo'
  const [text, setText] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [newBadge, setNewBadge] = useState(null)
  const fileRef = useRef()

  async function handleAssess() {
    if (!text.trim() && !photoFile) return
    setLoading(true)
    setResult(null)

    let contentToAssess = text

    // If photo, we send image to Claude
    let messages
    if (photoFile) {
      const base64 = await fileToBase64(photoFile)
      const mediaType = photoFile.type
      messages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: buildAssessPrompt('[transcribe from image]', ageGroup) }
        ]
      }]
    } else {
      messages = [{ role: 'user', content: buildAssessPrompt(contentToAssess, ageGroup) }]
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an expert English literature teacher assessing creative writing for students aged ${ageGroup}.
Return ONLY valid JSON, no markdown, no explanation. Use this exact structure:
{
  "title": "detected or inferred title",
  "summary": "1-2 sentence summary of the piece",
  "devices": [{"name": "SimileOrOther", "score": 0-100, "example": "short quote or 'not found'", "feedback": "brief tip"}],
  "quality": {"structure": 0-100, "emotion": 0-100, "creativity": 0-100, "vocabulary": 0-100, "devices": 0-100},
  "strengths": ["strength 1", "strength 2"],
  "improvements": [{"area": "area name", "tip": "specific advice", "classicExample": "2-3 lines from public domain literature", "classicSource": "Author, Title", "classicLink": "gutenberg url if available"}],
  "overallScore": 0-100,
  "badgeEarned": "device name from this list or null: ${LITERARY_DEVICES.join(', ')}"
}`,
          messages,
        })
      })
      const data = await response.json()
      const raw = data.content.map(i => i.text || '').join('')
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      addAssessment(parsed)
      if (parsed.badgeEarned) {
        earnBadge(parsed.badgeEarned)
        setNewBadge(parsed.badgeEarned)
      }
    } catch (e) {
      setResult({ error: 'Assessment failed. Please try again.' })
    }
    setLoading(false)
  }

  function fileToBase64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result.split(',')[1])
      r.onerror = () => rej(new Error('Read failed'))
      r.readAsDataURL(file)
    })
  }

  return (
    <div className="fade-up max-w-4xl">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest text-gold uppercase mb-2">Module 01</p>
        <h2 className="font-serif text-3xl text-silver mb-2">Upload & Assess</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm text-g600">Submit your creative writing for a full literary assessment. Type it in or photograph your written notes.</p>
      </div>

      {/* Input mode toggle */}
      <div className="flex gap-0 mb-6 border border-g800 w-fit">
        {[['type', '⌨️ Type'], ['photo', '📷 Photograph']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setMode(val)}
            className={`font-sans text-xs px-5 py-2.5 tracking-widest uppercase transition-all ${
              mode === val ? 'bg-oxford text-gold' : 'text-g600 hover:text-silver'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input area */}
      {mode === 'type' ? (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Begin writing your story here, or paste your existing work..."
          className="w-full h-48 bg-g800/50 border border-g800 text-silver font-sans text-sm p-4 resize-none focus:outline-none focus:border-gold/50 placeholder-g600 leading-relaxed"
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-g700 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors"
        >
          {photoFile ? (
            <p className="font-sans text-sm text-silver">{photoFile.name} ✓</p>
          ) : (
            <>
              <span className="text-3xl mb-2">📷</span>
              <p className="font-sans text-sm text-g600">Click to upload a photo of your writing</p>
              <p className="font-sans text-xs text-g700 mt-1">JPG, PNG supported</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setPhotoFile(e.target.files[0])} />
        </div>
      )}

      <button
        onClick={handleAssess}
        disabled={loading || (!text.trim() && !photoFile)}
        className="mt-4 font-sans text-xs tracking-widest uppercase px-8 py-3 bg-gold text-graphite font-bold hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Assessing...' : 'Assess My Writing →'}
      </button>

      {/* Results */}
      {result && !result.error && (
        <div className="mt-10 fade-up">

          {/* New badge notification */}
          {newBadge && (
            <div className="border border-gold bg-gold/10 p-4 mb-6 flex items-center gap-4">
              <span className="text-3xl badge-earned">
                {['🌸','🌻','🌷','🪻','🌹','🥐','🍰','🍩','🧁','🍜','🦋','🐝','🦚','🐠','🦊'][Math.floor(Math.random()*15)]}
              </span>
              <div>
                <p className="font-sans text-xs text-gold tracking-widest uppercase">New Badge Earned!</p>
                <p className="font-serif text-silver">{newBadge} Master</p>
              </div>
            </div>
          )}

          {/* Overall score */}
          <div className="border border-g800 p-6 mb-6" style={{background:'linear-gradient(135deg,#1a2332,#111827)'}}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-sans text-xs text-gold tracking-widest uppercase mb-1">Assessment Complete</p>
                <h3 className="font-serif text-xl text-silver italic">{result.title || 'Your Writing'}</h3>
                <p className="font-sans text-xs text-g600 mt-1 max-w-lg">{result.summary}</p>
              </div>
              <div className="text-right">
                <div className="font-serif text-4xl text-gold font-bold">{result.overallScore}</div>
                <div className="font-sans text-xs text-g600 tracking-widest">/ 100</div>
              </div>
            </div>

            {/* Quality bars */}
            <div className="space-y-2">
              {QUALITY_DIMENSIONS.map(d => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="font-sans text-xs text-g600 w-36 shrink-0">{d.label}</span>
                  <div className="flex-1 h-1.5 bg-g800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${result.quality?.[d.key] || 0}%`,
                        background: 'linear-gradient(90deg, #1F3A5F, #D4AF37)'
                      }}
                    />
                  </div>
                  <span className="font-sans text-xs text-gold w-8 text-right">{result.quality?.[d.key] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Literary devices rank card */}
          <div className="border border-g800 p-6 mb-6">
            <p className="font-sans text-xs text-gold tracking-widest uppercase mb-4">Literary Devices Rank Card</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(result.devices || []).map(d => (
                <div key={d.name} className="border border-g800 p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-serif text-sm text-silver">{d.name}</span>
                    <span className="font-sans text-xs text-gold">{d.score}/100</span>
                  </div>
                  <div className="h-1 bg-g800 mb-2 overflow-hidden">
                    <div className="h-full" style={{width:`${d.score}%`, background:'linear-gradient(90deg,#1F3A5F,#D4AF37)'}} />
                  </div>
                  {d.example && d.example !== 'not found' && (
                    <p className="font-sans text-xs text-g600 italic mb-1">"{d.example}"</p>
                  )}
                  <p className="font-sans text-xs text-g700">{d.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="border border-g800 p-5 mb-6">
              <p className="font-sans text-xs text-gold tracking-widest uppercase mb-3">Strengths</p>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="font-sans text-sm text-silver flex items-start gap-2">
                    <span className="text-gold mt-0.5">✦</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements with classic literature examples */}
          {result.improvements?.length > 0 && (
            <div className="border border-g800 p-5">
              <p className="font-sans text-xs text-gold tracking-widest uppercase mb-4">Areas for Improvement</p>
              <div className="space-y-5">
                {result.improvements.map((imp, i) => (
                  <div key={i} className="border-l-2 border-oxford pl-4">
                    <p className="font-serif text-sm text-silver mb-1">{imp.area}</p>
                    <p className="font-sans text-xs text-g600 mb-3">{imp.tip}</p>
                    {imp.classicExample && (
                      <div className="bg-g800/40 border border-g800 p-3 mt-2">
                        <p className="font-serif text-xs text-silver/70 italic leading-relaxed mb-2">{imp.classicExample}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs text-gold/60">— {imp.classicSource}</span>
                          {imp.classicLink && (
                            <a href={imp.classicLink} target="_blank" rel="noreferrer"
                               className="font-sans text-xs text-oxford hover:text-gold transition-colors">
                              Read more →
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div className="mt-6 border border-red-900/40 p-4 text-red-400 font-sans text-sm">{result.error}</div>
      )}
    </div>
  )
}

function buildAssessPrompt(text, ageGroup) {
  return `Please assess the following creative writing piece from a student aged ${ageGroup}. Transcribe from image if needed, then evaluate it thoroughly. Writing:\n\n${text}`
}
