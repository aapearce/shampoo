import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'

const STORY_TYPES = ['Adventure', 'Fantasy', 'Mystery', 'Science Fiction', 'Historical Fiction', 'Fable', 'Horror', 'Romance', 'Comedy']
const SETTINGS = ['A magical forest', 'A futuristic city', 'An ancient castle', 'Underwater kingdom', 'The moon', 'A small village', 'A desert island']
const THEMES = ['Friendship', 'Courage', 'Betrayal', 'Discovery', 'Redemption', 'Family', 'Identity', 'Justice']

export default function GenerateBrainstorm() {
  const { ageGroup } = useApp()
  const [mode, setMode] = useState('generate')
  const [storyType, setStoryType] = useState('')
  const [characters, setCharacters] = useState('')
  const [setting, setSetting] = useState('')
  const [theme, setTheme] = useState('')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [brainstormHistory, setBrainstormHistory] = useState([])
  const [brainstormInput, setBrainstormInput] = useState('')
  const [brainstormLoading, setBrainstormLoading] = useState(false)
  const [currentDraft, setCurrentDraft] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setStory('')
    setErrorMsg('')
    try {
      const result = await claudeChat({
        messages: [{ role: 'user', content:
          `Write a complete creative story for a student aged ${ageGroup}.
Story type: ${storyType||'any'}
Characters: ${characters||'your choice'}
Setting: ${setting||'your choice'}
Theme: ${theme||'your choice'}
Keywords to include: ${keywords||'none'}

Write an engaging, age-appropriate story with a clear beginning, middle, and end. Use rich literary devices. Length: 400-600 words.`
        }],
      })
      setStory(result)
    } catch (e) {
      setErrorMsg(e.message || 'Failed to generate story. Please try again.')
    }
    setLoading(false)
  }

  async function handleBrainstorm(userMsg) {
    if (!userMsg.trim()) return
    const newHistory = [...brainstormHistory, { role: 'user', content: userMsg }]
    setBrainstormHistory(newHistory)
    setBrainstormInput('')
    setBrainstormLoading(true)
    try {
      const reply = await claudeChat({
        system: `You are a warm, encouraging creative writing coach for students aged ${ageGroup}. Guide them through building their story interactively. Ask one focused question at a time. Help them develop characters, plot, setting, and literary devices step by step. After 4-5 exchanges, offer to write a short opening paragraph based on what they've shared. Keep responses concise and enthusiastic.`,
        messages: newHistory,
      })
      setBrainstormHistory(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setBrainstormHistory(prev => [...prev, { role: 'assistant', content: e.message || 'Something went wrong. Please try again.' }])
    }
    setBrainstormLoading(false)
  }

  async function handleFeedback() {
    if (!currentDraft.trim()) return
    setFeedbackLoading(true)
    setFeedback('')
    try {
      const result = await claudeChat({
        system: `You are an encouraging creative writing teacher for students aged ${ageGroup}. Give warm, specific, actionable feedback. Highlight what works well first, then give 2-3 concrete suggestions for improvement. Offer a rewritten version of their weakest paragraph as an example.`,
        messages: [{ role: 'user', content: `Please give me feedback on this writing and suggest improvements:\n\n${currentDraft}` }],
      })
      setFeedback(result)
    } catch (e) {
      setFeedback(e.message || 'Failed to get feedback. Please try again.')
    }
    setFeedbackLoading(false)
  }

  function startBrainstorm() {
    setBrainstormHistory([])
    handleBrainstorm(`I want to write a ${storyType||'story'} about ${characters||'some characters'} in ${setting||'an interesting setting'}. The theme is ${theme||'undecided'}. Help me brainstorm!`)
  }

  return (
    <div className="fade-up max-w-4xl">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest text-gold uppercase mb-2">Module 02</p>
        <h2 className="font-serif text-3xl text-silver mb-2">Generate & Brainstorm</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm text-g600">Build stories with AI. Generate a complete story instantly, or brainstorm interactively with your writing coach.</p>
      </div>

      <div className="flex gap-0 mb-8 border border-g800 w-fit">
        {[['generate','⚡ Generate Story'],['brainstorm','💬 Brainstorm'],['feedback','🔍 Get Feedback']].map(([val,label]) => (
          <button key={val} onClick={() => setMode(val)}
            className={`font-sans text-xs px-5 py-2.5 tracking-widest uppercase transition-all ${mode===val?'bg-oxford text-gold':'text-g600 hover:text-silver'}`}>
            {label}
          </button>
        ))}
      </div>

      {(mode==='generate'||mode==='brainstorm') && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-sans text-xs text-g600 tracking-widest uppercase block mb-2">Story Type</label>
            <div className="flex flex-wrap gap-2">
              {STORY_TYPES.map(t => (
                <button key={t} onClick={() => setStoryType(t)}
                  className={`font-sans text-xs px-3 py-1.5 border transition-all ${storyType===t?'border-gold text-gold bg-gold/10':'border-g800 text-g600 hover:border-g700'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="font-sans text-xs text-g600 tracking-widest uppercase block mb-1">Characters</label>
              <input value={characters} onChange={e=>setCharacters(e.target.value)} placeholder="e.g. a brave girl, a talking fox..."
                className="w-full bg-g800/50 border border-g800 text-silver font-sans text-xs p-2.5 focus:outline-none focus:border-gold/50 placeholder-g700" />
            </div>
            <div>
              <label className="font-sans text-xs text-g600 tracking-widest uppercase block mb-1">Setting</label>
              <div className="flex flex-wrap gap-1.5">
                {SETTINGS.map(s => (
                  <button key={s} onClick={() => setSetting(s)}
                    className={`font-sans text-xs px-2.5 py-1 border transition-all ${setting===s?'border-gold text-gold bg-gold/10':'border-g800 text-g600 hover:border-g700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-sans text-xs text-g600 tracking-widest uppercase block mb-1">Theme</label>
              <div className="flex flex-wrap gap-1.5">
                {THEMES.map(t => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={`font-sans text-xs px-2.5 py-1 border transition-all ${theme===t?'border-gold text-gold bg-gold/10':'border-g800 text-g600 hover:border-g700'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-sans text-xs text-g600 tracking-widest uppercase block mb-1">Keywords (optional)</label>
              <input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="e.g. moonlight, ancient map, secret..."
                className="w-full bg-g800/50 border border-g800 text-silver font-sans text-xs p-2.5 focus:outline-none focus:border-gold/50 placeholder-g700" />
            </div>
          </div>
        </div>
      )}

      {mode==='generate' && (
        <>
          <button onClick={handleGenerate} disabled={loading}
            className="font-sans text-xs tracking-widest uppercase px-8 py-3 bg-gold text-graphite font-bold hover:bg-gold-light transition-colors disabled:opacity-40">
            {loading ? 'Writing...' : 'Generate Story →'}
          </button>
          {errorMsg && <div className="mt-4 border border-red-900/40 p-3 text-red-400 font-sans text-sm">{errorMsg}</div>}
          {story && (
            <div className="mt-8 border border-g800 p-6">
              <p className="font-sans text-xs text-gold tracking-widest uppercase mb-4">Generated Story</p>
              <div className="font-serif text-sm text-silver leading-relaxed whitespace-pre-wrap">{story}</div>
              <button onClick={() => { setCurrentDraft(story); setMode('feedback') }}
                className="mt-4 font-sans text-xs tracking-widest text-oxford hover:text-gold transition-colors">
                Get Feedback on this story →
              </button>
            </div>
          )}
        </>
      )}

      {mode==='brainstorm' && (
        <>
          {brainstormHistory.length===0 ? (
            <button onClick={startBrainstorm}
              className="font-sans text-xs tracking-widest uppercase px-8 py-3 bg-gold text-graphite font-bold hover:bg-gold-light transition-colors">
              Start Brainstorming →
            </button>
          ) : (
            <div className="border border-g800">
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {brainstormHistory.map((msg,i) => (
                  <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
                    <div className={`max-w-lg p-3 font-sans text-sm leading-relaxed ${
                      msg.role==='user' ? 'bg-oxford/40 text-silver border border-oxford/30' : 'bg-g800/60 text-silver border border-g800'
                    }`}>{msg.content}</div>
                  </div>
                ))}
                {brainstormLoading && (
                  <div className="flex justify-start">
                    <div className="bg-g800/60 border border-g800 p-3 font-sans text-sm text-g600 italic">Thinking...</div>
                  </div>
                )}
              </div>
              <div className="border-t border-g800 flex">
                <input value={brainstormInput} onChange={e=>setBrainstormInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleBrainstorm(brainstormInput)}
                  placeholder="Type your response..."
                  className="flex-1 bg-transparent border-none text-silver font-sans text-sm p-3 focus:outline-none placeholder-g700" />
                <button onClick={()=>handleBrainstorm(brainstormInput)} disabled={brainstormLoading}
                  className="font-sans text-xs px-4 text-gold hover:text-gold-light border-l border-g800 disabled:opacity-40">
                  Send →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mode==='feedback' && (
        <div>
          <textarea value={currentDraft} onChange={e=>setCurrentDraft(e.target.value)}
            placeholder="Paste or write your story here to get feedback..."
            className="w-full h-48 bg-g800/50 border border-g800 text-silver font-sans text-sm p-4 resize-none focus:outline-none focus:border-gold/50 placeholder-g600 leading-relaxed mb-4" />
          <button onClick={handleFeedback} disabled={feedbackLoading||!currentDraft.trim()}
            className="font-sans text-xs tracking-widest uppercase px-8 py-3 bg-gold text-graphite font-bold hover:bg-gold-light transition-colors disabled:opacity-40">
            {feedbackLoading ? 'Reading...' : 'Get Feedback & Rewrite Suggestions →'}
          </button>
          {feedback && (
            <div className="mt-6 border border-g800 p-6">
              <p className="font-sans text-xs text-gold tracking-widest uppercase mb-4">Feedback & Suggestions</p>
              <div className="font-sans text-sm text-silver leading-relaxed whitespace-pre-wrap">{feedback}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
