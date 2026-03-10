import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'

const LITERARY_DEVICES = [
  'Simile','Metaphor','Personification','Alliteration','Assonance',
  'Onomatopoeia','Hyperbole','Understatement','Irony','Sarcasm',
  'Oxymoron','Paradox','Symbolism','Imagery','Foreshadowing',
  'Flashback','Dialogue','Idiom','Euphemism','Allegory',
  'Allusion','Anaphora','Juxtaposition','Motif','Theme',
  'Tone','Mood','Point of View','Extended Metaphor','Stream of Consciousness'
]

const QUALITY_DIMENSIONS = [
  { key: 'structure', label: 'Story Structure' },
  { key: 'emotion',   label: 'Emotional Depth' },
  { key: 'creativity',label: 'Creativity' },
  { key: 'vocabulary',label: 'Vocabulary' },
  { key: 'devices',   label: 'Literary Devices' },
]

const S = {
  page:  { color: '#F5ECD7' },
  label: { color: '#D4AF37' },
  body:  { color: '#C8B99A' },
  hint:  { color: '#8A7A68' },
  border:{ border: '1px solid #1A3358' },
  card:  { background: 'linear-gradient(135deg,#112040,#0B1628)', border: '1px solid #1A3358' },
}

// Expandable classic literature passage
function ClassicPassage({ imp }) {
  const [expanded, setExpanded] = useState(false)
  const [fullText, setFullText]   = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleExpand() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (fullText) return  // already loaded
    setLoading(true)
    try {
      const result = await claudeChat({
        messages: [{
          role: 'user',
          content: `Provide a longer excerpt (10-15 lines) from the public domain work "${imp.classicSource}" that demonstrates ${imp.area}. The short passage shown is: "${imp.classicExample}". Return only the extended passage text, no explanation or preamble. If this exact work is not available, provide a comparable passage from the same author or era that demonstrates the same technique.`
        }]
      })
      setFullText(result)
    } catch {
      setFullText('Could not load the extended passage. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="p-3 mt-2" style={{ background: 'rgba(17,32,64,0.5)', border: '1px solid #1A3358' }}>

      {/* Always-visible short excerpt */}
      <p className="font-serif text-xs italic leading-relaxed mb-3"
        style={{ color: 'rgba(245,236,215,0.75)' }}>
        {imp.classicExample}
      </p>

      {/* Expanded full passage */}
      {expanded && (
        <div className="mb-3 pt-3" style={{ borderTop: '1px solid #1A3358' }}>
          {loading ? (
            <p className="font-sans text-xs italic" style={S.hint}>Loading passage...</p>
          ) : (
            <p className="font-serif text-sm italic leading-relaxed"
              style={{ color: 'rgba(245,236,215,0.85)' }}>
              {fullText}
            </p>
          )}
        </div>
      )}

      {/* Footer row: source + expand toggle */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs" style={{ color: 'rgba(212,175,55,0.7)' }}>
          — {imp.classicSource}
        </span>
        <button
          onClick={handleExpand}
          className="font-sans text-xs transition-colors"
          style={{ color: '#7A9CC0' }}
        >
          {expanded ? '↑ Show less' : '↓ Read more'}
        </button>
      </div>
    </div>
  )
}

export default function UploadAssess() {
  const { ageGroup, earnBadge, addAssessment } = useApp()
  const [mode, setMode]           = useState('type')
  const [text, setText]           = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [newBadge, setNewBadge]   = useState(null)
  const [errorMsg, setErrorMsg]   = useState('')
  const fileRef = useRef()

  async function handleAssess() {
    if (!text.trim() && !photoFile) return
    setLoading(true); setResult(null); setErrorMsg('')
    let messages
    if (photoFile) {
      const base64 = await fileToBase64(photoFile)
      messages = [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: photoFile.type, data: base64 } },
        { type: 'text', text: buildPrompt('[transcribe from image above]', ageGroup) }
      ]}]
    } else {
      messages = [{ role: 'user', content: buildPrompt(text, ageGroup) }]
    }
    try {
      const raw = await claudeChat({
        system: systemPrompt(ageGroup, LITERARY_DEVICES),
        messages, max_tokens: 1000,
      })
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setResult(parsed); addAssessment(parsed)
      if (parsed.badgeEarned) { earnBadge(parsed.badgeEarned); setNewBadge(parsed.badgeEarned) }
    } catch(e) { setErrorMsg(e.message || 'Assessment failed. Please try again.') }
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
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 01</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Upload & Assess</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>Submit your creative writing for a full literary assessment. Type it in or photograph your written notes.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex mb-6 w-fit" style={{ border: '1px solid #1A3358' }}>
        {[['type','⌨️ Type'],['photo','📷 Photograph']].map(([val, label]) => (
          <button key={val} onClick={() => setMode(val)}
            className="font-sans text-xs px-5 py-2.5 tracking-widest uppercase transition-all"
            style={mode === val ? { background: '#1F3A5F', color: '#D4AF37' } : { color: '#C8B99A' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      {mode === 'type' ? (
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Begin writing your story here, or paste your existing work..."
          className="w-full h-48 font-sans text-sm p-4 resize-none focus:outline-none leading-relaxed"
          style={{ background: 'rgba(17,32,64,0.6)', border: '1px solid #1A3358', color: '#F5ECD7' }} />
      ) : (
        <div onClick={() => fileRef.current?.click()}
          className="h-48 flex flex-col items-center justify-center cursor-pointer transition-colors"
          style={{ border: '1px dashed #2A4A6B' }}>
          {photoFile
            ? <p className="font-sans text-sm" style={S.page}>{photoFile.name} ✓</p>
            : <><span className="text-3xl mb-2">📷</span>
               <p className="font-sans text-sm" style={S.body}>Click to upload a photo of your writing</p>
               <p className="font-sans text-xs mt-1" style={S.hint}>JPG, PNG supported</p></>
          }
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => setPhotoFile(e.target.files[0])} />
        </div>
      )}

      <button onClick={handleAssess} disabled={loading || (!text.trim() && !photoFile)}
        className="mt-4 font-sans text-xs tracking-widest uppercase px-8 py-3 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#D4AF37', color: '#0B1628' }}>
        {loading ? 'Assessing...' : 'Assess My Writing →'}
      </button>

      {errorMsg && (
        <div className="mt-6 p-4 font-sans text-sm"
          style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
          {errorMsg}
        </div>
      )}

      {result && (
        <div className="mt-10 fade-up">

          {newBadge && (
            <div className="p-4 mb-6 flex items-center gap-4"
              style={{ border: '1px solid #D4AF37', background: 'rgba(212,175,55,0.08)' }}>
              <span className="text-3xl badge-earned">🏅</span>
              <div>
                <p className="font-sans text-xs tracking-widest uppercase" style={S.label}>New Badge Earned!</p>
                <p className="font-serif" style={S.page}>{newBadge} Master</p>
              </div>
            </div>
          )}

          {/* Score card */}
          <div className="p-6 mb-6" style={S.card}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-sans text-xs tracking-widest uppercase mb-1" style={S.label}>Assessment Complete</p>
                <h3 className="font-serif text-xl italic" style={S.page}>{result.title || 'Your Writing'}</h3>
                <p className="font-sans text-xs mt-1 max-w-lg" style={S.body}>{result.summary}</p>
              </div>
              <div className="text-right">
                <div className="font-serif text-4xl font-bold" style={S.label}>{result.overallScore}</div>
                <div className="font-sans text-xs tracking-widest" style={S.hint}>/ 100</div>
              </div>
            </div>
            <div className="space-y-2">
              {QUALITY_DIMENSIONS.map(d => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="font-sans text-xs w-36 shrink-0" style={S.body}>{d.label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#112040' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${result.quality?.[d.key] || 0}%`, background: 'linear-gradient(90deg,#1F3A5F,#D4AF37)' }} />
                  </div>
                  <span className="font-sans text-xs w-8 text-right" style={S.label}>{result.quality?.[d.key] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Devices rank card */}
          <div className="p-6 mb-6" style={S.border}>
            <p className="font-sans text-xs tracking-widest uppercase mb-4" style={S.label}>Literary Devices Rank Card</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(result.devices || []).map(d => (
                <div key={d.name} className="p-3" style={S.border}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-serif text-sm" style={S.page}>{d.name}</span>
                    <span className="font-sans text-xs" style={S.label}>{d.score}/100</span>
                  </div>
                  <div className="h-1 mb-2 overflow-hidden" style={{ background: '#112040' }}>
                    <div className="h-full" style={{ width: `${d.score}%`, background: 'linear-gradient(90deg,#1F3A5F,#D4AF37)' }} />
                  </div>
                  {d.example && d.example !== 'not found' &&
                    <p className="font-sans text-xs italic mb-1" style={S.body}>"{d.example}"</p>}
                  <p className="font-sans text-xs" style={S.hint}>{d.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="p-5 mb-6" style={S.border}>
              <p className="font-sans text-xs tracking-widest uppercase mb-3" style={S.label}>Strengths</p>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="font-sans text-sm flex items-start gap-2" style={S.page}>
                    <span style={S.label}>✦</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements with expandable classic passages */}
          {result.improvements?.length > 0 && (
            <div className="p-5" style={S.border}>
              <p className="font-sans text-xs tracking-widest uppercase mb-4" style={S.label}>Areas for Improvement</p>
              <div className="space-y-5">
                {result.improvements.map((imp, i) => (
                  <div key={i} className="pl-4" style={{ borderLeft: '2px solid #1F3A5F' }}>
                    <p className="font-serif text-sm mb-1" style={S.page}>{imp.area}</p>
                    <p className="font-sans text-xs mb-3" style={S.body}>{imp.tip}</p>
                    {imp.classicExample && <ClassicPassage imp={imp} />}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function buildPrompt(text, ag) {
  return `Please assess the following creative writing piece from a student aged ${ag}. Transcribe from image if needed. Writing:\n\n${text}`
}
function systemPrompt(ag, devices) {
  return `You are an expert English literature teacher assessing creative writing for students aged ${ag}.
Return ONLY valid JSON, no markdown. Structure:
{
  "title": "...",
  "summary": "...",
  "devices": [{"name":"...","score":0-100,"example":"...","feedback":"..."}],
  "quality": {"structure":0-100,"emotion":0-100,"creativity":0-100,"vocabulary":0-100,"devices":0-100},
  "strengths": ["..."],
  "improvements": [{"area":"...","tip":"...","classicExample":"...","classicSource":"...","classicLink":"..."}],
  "overallScore": 0-100,
  "badgeEarned": "device name or null from: ${devices.join(', ')}"
}`
}
