import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'

// ── Data ───────────────────────────────────────────────────────────────────────
const FICTION_TYPES     = ['Adventure','Fantasy','Mystery','Science Fiction','Historical Fiction','Fable','Horror','Romance','Comedy']
const NONFICTION_TOPICS = ['Geography','Climate Change','Science','History','Biography','Nature','Technology','Space','Animals','Culture']
const SETTINGS          = ['A magical forest','A futuristic city','An ancient castle','Underwater kingdom','The moon','A small village','A desert island','A busy school']
const THEMES            = ['Friendship','Courage','Betrayal','Discovery','Redemption','Family','Identity','Justice']

const S = {
  page:  { color: '#F5ECD7' },
  label: { color: '#D4AF37' },
  body:  { color: '#C8B99A' },
  hint:  { color: '#8A7A68' },
  border:{ border: '1px solid #1A3358' },
  input: { background: 'rgba(17,32,64,0.6)', border: '1px solid #1A3358', color: '#F5ECD7' },
}
const chipActive   = { borderColor: '#D4AF37', color: '#D4AF37', background: 'rgba(212,175,55,0.1)' }
const chipInactive = { borderColor: '#1A3358', color: '#C8B99A' }

// ── Options panel ──────────────────────────────────────────────────────────────
function OptionsPanel({ genre, setGenre, writingMode, setWritingMode, characters, setCharacters,
  setting, setSetting, theme, setTheme, keywords, setKeywords, topic, setTopic }) {
  return (
    <div className="space-y-4 font-sans text-xs">
      <div>
        <label className="tracking-widest uppercase block mb-2" style={S.hint}>Writing Mode</label>
        <div className="flex" style={S.border}>
          {[['fiction','📖 Fiction'],['nonfiction','📰 Non-Fiction']].map(([val,lbl]) => (
            <button key={val} onClick={() => { setWritingMode(val); setGenre(''); setTopic('') }}
              className="flex-1 py-2 tracking-widest uppercase transition-all text-xs"
              style={writingMode === val ? { background:'#1F3A5F', color:'#D4AF37' } : { color:'#C8B99A' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {writingMode === 'fiction' && (<>
        <div>
          <label className="tracking-widest uppercase block mb-2" style={S.hint}>Genre</label>
          <div className="flex flex-wrap gap-1.5">
            {FICTION_TYPES.map(t => (
              <button key={t} onClick={() => setGenre(g => g === t ? '' : t)}
                className="px-2.5 py-1 border transition-all text-xs"
                style={genre === t ? chipActive : chipInactive}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="tracking-widest uppercase block mb-2" style={S.hint}>Setting</label>
          <div className="flex flex-wrap gap-1.5">
            {SETTINGS.map(s => (
              <button key={s} onClick={() => setSetting(v => v === s ? '' : s)}
                className="px-2.5 py-1 border transition-all text-xs"
                style={setting === s ? chipActive : chipInactive}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="tracking-widest uppercase block mb-2" style={S.hint}>Theme</label>
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map(t => (
              <button key={t} onClick={() => setTheme(v => v === t ? '' : t)}
                className="px-2.5 py-1 border transition-all text-xs"
                style={theme === t ? chipActive : chipInactive}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="tracking-widest uppercase block mb-1.5" style={S.hint}>Characters</label>
          <input value={characters} onChange={e => setCharacters(e.target.value)}
            placeholder="e.g. a brave girl, a talking fox..."
            className="w-full p-2.5 focus:outline-none text-xs" style={S.input} />
        </div>
      </>)}

      {writingMode === 'nonfiction' && (
        <div>
          <label className="tracking-widest uppercase block mb-2" style={S.hint}>Topic</label>
          <div className="flex flex-wrap gap-1.5">
            {NONFICTION_TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(v => v === t ? '' : t)}
                className="px-2.5 py-1 border transition-all text-xs"
                style={topic === t ? chipActive : chipInactive}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="tracking-widest uppercase block mb-1.5" style={S.hint}>Keywords (optional)</label>
        <input value={keywords} onChange={e => setKeywords(e.target.value)}
          placeholder="e.g. moonlight, ancient map..."
          className="w-full p-2.5 focus:outline-none text-xs" style={S.input} />
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function GenerateBrainstorm() {
  const { ageGroup } = useApp()

  const [mode, setMode] = useState('generate')

  // Shared options
  const [writingMode, setWritingMode] = useState('fiction')
  const [genre,       setGenre]       = useState('')
  const [topic,       setTopic]       = useState('')
  const [characters,  setCharacters]  = useState('')
  const [setting,     setSetting]     = useState('')
  const [theme,       setTheme]       = useState('')
  const [keywords,    setKeywords]    = useState('')

  const [optionsOpen, setOptionsOpen] = useState(false)

  // Generate
  const [loading,  setLoading]  = useState(false)
  const [story,    setStory]    = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const storyBoxRef = useRef(null)

  // Brainstorm — history holds ONLY the real visible turns (no hidden priming)
  const [brainstormHistory,  setBrainstormHistory]  = useState([])
  const [brainstormInput,    setBrainstormInput]    = useState('')
  const [brainstormLoading,  setBrainstormLoading]  = useState(false)
  // The system prompt snapshot used for the current chat session
  const [chatSystem, setChatSystem] = useState('')
  const chatEndRef = useRef(null)

  // Feedback
  const [currentDraft,    setCurrentDraft]    = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedback,        setFeedback]        = useState('')

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [brainstormHistory, brainstormLoading])

  // Start chat when switching to brainstorm (if empty)
  useEffect(() => {
    if (mode === 'brainstorm' && brainstormHistory.length === 0) {
      startChat()
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Build a human-readable context label (for display only)
  function buildContextLabel() {
    if (writingMode === 'nonfiction') {
      return `Non-fiction${topic ? ` · ${topic}` : ''}${keywords ? ` · ${keywords}` : ''}`
    }
    return [
      genre      && genre,
      setting    && setting,
      theme      && `theme: ${theme}`,
      characters && characters,
      keywords   && keywords,
    ].filter(Boolean).join(' · ') || 'Open topic'
  }

  // Build the system prompt — called once per session, snapshot stored in chatSystem
  function buildSystemPrompt() {
    const contextHints = writingMode === 'nonfiction'
      ? `The student wants to write a non-fiction piece${topic ? ` about ${topic}` : ''}${keywords ? ` involving: ${keywords}` : ''}. Help them develop ideas, structure, and interesting angles for this topic.`
      : [
          genre      && `genre: ${genre}`,
          setting    && `setting: ${setting}`,
          theme      && `theme: ${theme}`,
          characters && `characters: ${characters}`,
          keywords   && `keywords: ${keywords}`,
        ].filter(Boolean).length > 0
        ? `The student has these ideas so far: ${[
            genre      && `genre: ${genre}`,
            setting    && `setting: ${setting}`,
            theme      && `theme: ${theme}`,
            characters && `characters: ${characters}`,
            keywords   && `keywords: ${keywords}`,
          ].filter(Boolean).join(', ')}. Help them develop these further.`
        : 'The student has no specific ideas yet — help them discover what they want to write about.'

    return `You are a warm, encouraging creative writing coach for students aged ${ageGroup}. ${contextHints}

IMPORTANT RULES:
- Ask ONE focused question at a time — never more
- Follow the student's lead completely. If they mention a new idea, character, or topic, embrace it — never redirect them back to something from earlier
- After 4–5 back-and-forth exchanges, offer to write a short opening paragraph based on whatever they have developed
- Keep each response to 2–4 sentences maximum
- Be enthusiastic and supportive`
  }

  async function startChat(overrideSystem) {
    const sys = overrideSystem || buildSystemPrompt()
    setChatSystem(sys)
    setBrainstormLoading(true)
    try {
      const reply = await claudeChat({
        system: sys,
        messages: [{ role: 'user', content: "Hi! I'm ready to brainstorm my writing." }]
      })
      // Show only the coach's opening — don't show the throwaway user message
      setBrainstormHistory([{ role: 'assistant', content: reply }])
    } catch(e) {
      setBrainstormHistory([{ role: 'assistant', content: "Hi! I'm your writing coach — what would you like to write about today?" }])
    }
    setBrainstormLoading(false)
  }

  async function handleBrainstorm(userMsg) {
    if (!userMsg.trim() || brainstormLoading) return
    // Build full history to send: include the hidden opening turn so context is preserved
    const visibleHistory = [...brainstormHistory, { role: 'user', content: userMsg }]
    setBrainstormHistory(visibleHistory)
    setBrainstormInput('')
    setBrainstormLoading(true)

    // Reconstruct the full messages array with the hidden priming turn prepended
    const fullMessages = [
      { role: 'user',      content: "Hi! I'm ready to brainstorm my writing." },
      { role: 'assistant', content: brainstormHistory[0]?.content || '' },
      ...visibleHistory.slice(1),
    ]

    try {
      const reply = await claudeChat({
        system: chatSystem,   // use the snapshot — never regenerate mid-conversation
        messages: fullMessages,
      })
      setBrainstormHistory(prev => [...prev, { role: 'assistant', content: reply }])
    } catch(e) {
      setBrainstormHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again!' }])
    }
    setBrainstormLoading(false)
  }

  function restartChat() {
    setBrainstormHistory([])
    setOptionsOpen(false)
    setTimeout(() => startChat(), 50)
  }

  async function handleGenerate() {
    setLoading(true); setStory(''); setErrorMsg('')
    const ctx = writingMode === 'nonfiction'
      ? `Non-fiction piece${topic ? ` about ${topic}` : ''}${keywords ? `, keywords: ${keywords}` : ''}`
      : [genre && `Genre: ${genre}`, characters && `Characters: ${characters}`,
         setting && `Setting: ${setting}`, theme && `Theme: ${theme}`,
         keywords && `Keywords: ${keywords}`].filter(Boolean).join(' | ') || 'open topic'
    try {
      const result = await claudeChat({ messages: [{ role: 'user', content:
        writingMode === 'nonfiction'
          ? `Write an engaging non-fiction piece for a student aged ${ageGroup}. ${ctx}. Make it informative, vivid, and age-appropriate. 400–600 words.`
          : `Write a complete creative story for a student aged ${ageGroup}. ${ctx}. Engaging, age-appropriate, clear beginning/middle/end, rich literary devices. 400–600 words.`
      }]})
      setStory(result)
      // Scroll output into view after a tick
      setTimeout(() => storyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch(e) { setErrorMsg(e.message || 'Failed to generate. Please try again.') }
    setLoading(false)
  }

  async function handleFeedback() {
    if (!currentDraft.trim()) return
    setFeedbackLoading(true); setFeedback('')
    try {
      const result = await claudeChat({
        system: `You are an encouraging creative writing teacher for students aged ${ageGroup}. Give warm, specific, actionable feedback. Highlight strengths first, then 2–3 concrete improvements. Offer a rewritten version of their weakest paragraph.`,
        messages: [{ role: 'user', content: `Please give feedback and suggest improvements:\n\n${currentDraft}` }],
      })
      setFeedback(result)
    } catch(e) { setFeedback(e.message || 'Failed to get feedback.') }
    setFeedbackLoading(false)
  }

  const btnActive   = { background: '#1F3A5F', color: '#D4AF37' }
  const btnInactive = { color: '#C8B99A' }

  return (
    <div className="fade-up">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 02</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Generate & Brainstorm</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>Build stories and essays with AI — generate instantly, or brainstorm interactively with your writing coach.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex mb-8 w-fit" style={S.border}>
        {[['generate','⚡ Generate'],['brainstorm','💬 Brainstorm'],['feedback','🔍 Feedback']].map(([val,lbl]) => (
          <button key={val} onClick={() => setMode(val)}
            className="font-sans text-xs px-5 py-2.5 tracking-widest uppercase transition-all"
            style={mode === val ? btnActive : btnInactive}>{lbl}</button>
        ))}
      </div>

      {/* ── GENERATE ── */}
      {mode === 'generate' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: options */}
          <div className="p-5" style={S.border}>
            <p className="font-sans text-xs tracking-widest uppercase mb-4" style={S.label}>Options</p>
            <OptionsPanel
              writingMode={writingMode} setWritingMode={setWritingMode}
              genre={genre} setGenre={setGenre}
              topic={topic} setTopic={setTopic}
              characters={characters} setCharacters={setCharacters}
              setting={setting} setSetting={setSetting}
              theme={theme} setTheme={setTheme}
              keywords={keywords} setKeywords={setKeywords}
            />
            <button onClick={handleGenerate} disabled={loading}
              className="mt-6 w-full font-sans text-xs tracking-widest uppercase py-3 font-bold transition-colors disabled:opacity-40"
              style={{ background: '#D4AF37', color: '#0B1628' }}>
              {loading ? 'Writing...' : writingMode === 'nonfiction' ? 'Generate Essay →' : 'Generate Story →'}
            </button>
          </div>

          {/* Right: output — fixed height, scrollable */}
          <div ref={storyBoxRef}>
            {errorMsg && (
              <div className="p-3 font-sans text-sm mb-4" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>{errorMsg}</div>
            )}
            {loading && (
              <div className="p-8 flex items-center justify-center" style={{ ...S.border, height: '480px' }}>
                <p className="font-sans text-xs tracking-widest uppercase" style={S.hint}>Writing your {writingMode === 'nonfiction' ? 'essay' : 'story'}...</p>
              </div>
            )}
            {story && !loading && (
              <div style={{ ...S.border, height: '480px', display: 'flex', flexDirection: 'column' }}>
                {/* Sticky header */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0"
                  style={{ borderBottom: '1px solid #1A3358', background: 'rgba(11,22,40,0.95)' }}>
                  <p className="font-sans text-xs tracking-widest uppercase" style={S.label}>
                    {writingMode === 'nonfiction' ? 'Generated Essay' : 'Generated Story'}
                  </p>
                  <button onClick={() => { setCurrentDraft(story); setMode('feedback') }}
                    className="font-sans text-xs tracking-widest transition-colors" style={{ color: '#7A9CC0' }}>
                    Get Feedback →
                  </button>
                </div>
                {/* Scrollable text */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap" style={S.page}>{story}</div>
                </div>
              </div>
            )}
            {!story && !loading && !errorMsg && (
              <div className="p-8 flex flex-col items-center justify-center gap-2"
                style={{ ...S.border, height: '480px' }}>
                <span className="text-3xl opacity-30">✍️</span>
                <p className="font-sans text-xs" style={S.hint}>Choose your options and generate</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BRAINSTORM ── */}
      {mode === 'brainstorm' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Chat column (2/3) */}
          <div className="md:col-span-2 flex flex-col">
            {/* Scrollable chat history — fixed height */}
            <div className="p-4 space-y-4 overflow-y-auto"
              style={{ ...S.border, height: '420px' }}>
              {brainstormHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-sm p-3 font-sans text-sm leading-relaxed"
                    style={msg.role === 'user'
                      ? { background: 'rgba(31,58,95,0.5)', color: '#F5ECD7', border: '1px solid rgba(31,58,95,0.6)' }
                      : { background: 'rgba(17,32,64,0.7)', color: '#C8B99A', border: '1px solid #1A3358' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {brainstormLoading && (
                <div className="flex justify-start">
                  <div className="p-3 font-sans text-sm italic"
                    style={{ background: 'rgba(17,32,64,0.7)', color: '#8A7A68', border: '1px solid #1A3358' }}>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="flex" style={{ border: '1px solid #1A3358', borderTop: '0' }}>
              <input value={brainstormInput}
                onChange={e => setBrainstormInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBrainstorm(brainstormInput)}
                placeholder="Type your response..."
                className="flex-1 bg-transparent font-sans text-sm p-3 focus:outline-none"
                style={{ color: '#F5ECD7', background: 'rgba(17,32,64,0.4)' }}
              />
              <button onClick={() => handleBrainstorm(brainstormInput)}
                disabled={brainstormLoading || !brainstormInput.trim()}
                className="font-sans text-xs px-5 transition-colors disabled:opacity-40"
                style={{ color: '#D4AF37', borderLeft: '1px solid #1A3358', background: 'rgba(17,32,64,0.4)' }}>
                Send →
              </button>
            </div>

            <button onClick={restartChat}
              className="mt-2 font-sans text-xs self-start transition-colors"
              style={{ color: '#8A7A68' }}>
              ↺ Start fresh
            </button>
          </div>

          {/* Options column (1/3) */}
          <div>
            <button onClick={() => setOptionsOpen(o => !o)}
              className="w-full font-sans text-xs tracking-widest uppercase py-2.5 px-4 mb-3 flex items-center justify-between transition-all"
              style={{ ...S.border, color: optionsOpen ? '#D4AF37' : '#C8B99A', background: optionsOpen ? 'rgba(212,175,55,0.06)' : 'transparent' }}>
              <span>⚙ Writing Options</span>
              <span style={{ fontSize: '10px' }}>{optionsOpen ? '▲' : '▼'}</span>
            </button>

            {optionsOpen && (
              <div className="p-4" style={S.border}>
                <OptionsPanel
                  writingMode={writingMode} setWritingMode={setWritingMode}
                  genre={genre} setGenre={setGenre}
                  topic={topic} setTopic={setTopic}
                  characters={characters} setCharacters={setCharacters}
                  setting={setting} setSetting={setSetting}
                  theme={theme} setTheme={setTheme}
                  keywords={keywords} setKeywords={setKeywords}
                />
                <button onClick={restartChat}
                  className="mt-4 w-full font-sans text-xs tracking-widest uppercase py-2 transition-colors"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                  Restart with these options →
                </button>
              </div>
            )}

            {!optionsOpen && (
              <div className="p-3 font-sans text-xs" style={{ background: 'rgba(17,32,64,0.4)', border: '1px solid #1A3358' }}>
                <span className="block mb-1" style={S.hint}>Current context:</span>
                <span style={S.body}>{buildContextLabel()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FEEDBACK ── */}
      {mode === 'feedback' && (
        <div className="max-w-2xl">
          <textarea value={currentDraft} onChange={e => setCurrentDraft(e.target.value)}
            placeholder="Paste or write your story or essay here to get feedback..."
            className="w-full h-48 font-sans text-sm p-4 resize-none focus:outline-none leading-relaxed mb-4"
            style={S.input} />
          <button onClick={handleFeedback} disabled={feedbackLoading || !currentDraft.trim()}
            className="font-sans text-xs tracking-widest uppercase px-8 py-3 font-bold transition-colors disabled:opacity-40"
            style={{ background: '#D4AF37', color: '#0B1628' }}>
            {feedbackLoading ? 'Reading...' : 'Get Feedback & Rewrite Suggestions →'}
          </button>
          {feedback && (
            <div className="mt-6 p-6" style={S.border}>
              <p className="font-sans text-xs tracking-widest uppercase mb-4" style={S.label}>Feedback & Suggestions</p>
              <div className="font-sans text-sm leading-relaxed whitespace-pre-wrap" style={S.body}>{feedback}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
