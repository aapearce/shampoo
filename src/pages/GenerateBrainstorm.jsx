import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { claudeChat } from '../lib/claude'

const STORY_TYPES = ['Adventure','Fantasy','Mystery','Science Fiction','Historical Fiction','Fable','Horror','Romance','Comedy']
const SETTINGS   = ['A magical forest','A futuristic city','An ancient castle','Underwater kingdom','The moon','A small village','A desert island']
const THEMES     = ['Friendship','Courage','Betrayal','Discovery','Redemption','Family','Identity','Justice']

const S = {
  page:  {color:'#F5ECD7'},
  label: {color:'#D4AF37'},
  body:  {color:'#C8B99A'},
  hint:  {color:'#8A7A68'},
  border:{border:'1px solid #1A3358'},
  input: {background:'rgba(17,32,64,0.6)',border:'1px solid #1A3358',color:'#F5ECD7'},
}

export default function GenerateBrainstorm() {
  const { ageGroup } = useApp()
  const [mode,setMode]                     = useState('generate')
  const [storyType,setStoryType]           = useState('')
  const [characters,setCharacters]         = useState('')
  const [setting,setSetting]               = useState('')
  const [theme,setTheme]                   = useState('')
  const [keywords,setKeywords]             = useState('')
  const [loading,setLoading]               = useState(false)
  const [story,setStory]                   = useState('')
  const [errorMsg,setErrorMsg]             = useState('')
  const [brainstormHistory,setBrainstormHistory] = useState([])
  const [brainstormInput,setBrainstormInput]     = useState('')
  const [brainstormLoading,setBrainstormLoading] = useState(false)
  const [currentDraft,setCurrentDraft]     = useState('')
  const [feedbackLoading,setFeedbackLoading]= useState(false)
  const [feedback,setFeedback]             = useState('')

  async function handleGenerate() {
    setLoading(true); setStory(''); setErrorMsg('')
    try {
      const result = await claudeChat({ messages:[{ role:'user', content:
        `Write a complete creative story for a student aged ${ageGroup}.
Type: ${storyType||'any'} | Characters: ${characters||'your choice'} | Setting: ${setting||'your choice'} | Theme: ${theme||'your choice'} | Keywords: ${keywords||'none'}
Engaging, age-appropriate, clear beginning/middle/end, rich literary devices. 400-600 words.`
      }]})
      setStory(result)
    } catch(e) { setErrorMsg(e.message||'Failed to generate. Please try again.') }
    setLoading(false)
  }

  async function handleBrainstorm(userMsg) {
    if (!userMsg.trim()) return
    const newHistory = [...brainstormHistory,{role:'user',content:userMsg}]
    setBrainstormHistory(newHistory); setBrainstormInput(''); setBrainstormLoading(true)
    try {
      const reply = await claudeChat({
        system:`You are a warm, encouraging creative writing coach for students aged ${ageGroup}. Guide them interactively. Ask one focused question at a time. After 4-5 exchanges, offer to write a short opening paragraph based on their ideas. Keep responses concise and enthusiastic.`,
        messages:newHistory,
      })
      setBrainstormHistory(prev=>[...prev,{role:'assistant',content:reply}])
    } catch(e) {
      setBrainstormHistory(prev=>[...prev,{role:'assistant',content:e.message||'Something went wrong.'}])
    }
    setBrainstormLoading(false)
  }

  async function handleFeedback() {
    if (!currentDraft.trim()) return
    setFeedbackLoading(true); setFeedback('')
    try {
      const result = await claudeChat({
        system:`You are an encouraging creative writing teacher for students aged ${ageGroup}. Give warm, specific, actionable feedback. Highlight strengths first, then 2-3 concrete improvements. Offer a rewritten version of their weakest paragraph.`,
        messages:[{role:'user',content:`Please give feedback and suggest improvements:\n\n${currentDraft}`}],
      })
      setFeedback(result)
    } catch(e) { setFeedback(e.message||'Failed to get feedback.') }
    setFeedbackLoading(false)
  }

  function startBrainstorm() {
    setBrainstormHistory([])
    handleBrainstorm(`I want to write a ${storyType||'story'} about ${characters||'some characters'} in ${setting||'an interesting setting'}. Theme: ${theme||'undecided'}. Help me brainstorm!`)
  }

  const btnActive   = {background:'#1F3A5F',color:'#D4AF37'}
  const btnInactive = {color:'#C8B99A'}
  const chipActive  = {borderColor:'#D4AF37',color:'#D4AF37',background:'rgba(212,175,55,0.1)'}
  const chipInactive= {borderColor:'#1A3358',color:'#C8B99A'}

  return (
    <div className="fade-up max-w-4xl">
      <div className="mb-8">
        <p className="font-sans text-xs tracking-widest uppercase mb-2" style={S.label}>Module 02</p>
        <h2 className="font-serif text-3xl mb-2" style={S.page}>Generate & Brainstorm</h2>
        <div className="gold-bar w-16 mb-3" />
        <p className="font-sans text-sm" style={S.body}>Build stories with AI. Generate a complete story instantly, or brainstorm interactively with your writing coach.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex mb-8 w-fit" style={S.border}>
        {[['generate','⚡ Generate Story'],['brainstorm','💬 Brainstorm'],['feedback','🔍 Get Feedback']].map(([val,label])=>(
          <button key={val} onClick={()=>setMode(val)}
            className="font-sans text-xs px-5 py-2.5 tracking-widest uppercase transition-all"
            style={mode===val ? btnActive : btnInactive}>{label}</button>
        ))}
      </div>

      {/* Options */}
      {(mode==='generate'||mode==='brainstorm') && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-sans text-xs tracking-widest uppercase block mb-2" style={S.hint}>Story Type</label>
            <div className="flex flex-wrap gap-2">
              {STORY_TYPES.map(t=>(
                <button key={t} onClick={()=>setStoryType(t)}
                  className="font-sans text-xs px-3 py-1.5 border transition-all"
                  style={storyType===t ? chipActive : chipInactive}>{t}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[['Characters','e.g. a brave girl, a talking fox...',characters,setCharacters],
              ['Keywords (optional)','e.g. moonlight, ancient map...',keywords,setKeywords]].map(([lbl,ph,val,set])=>(
              <div key={lbl}>
                <label className="font-sans text-xs tracking-widest uppercase block mb-1" style={S.hint}>{lbl}</label>
                <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                  className="w-full font-sans text-xs p-2.5 focus:outline-none"
                  style={S.input} />
              </div>
            ))}
            <div>
              <label className="font-sans text-xs tracking-widest uppercase block mb-1" style={S.hint}>Setting</label>
              <div className="flex flex-wrap gap-1.5">
                {SETTINGS.map(s=>(
                  <button key={s} onClick={()=>setSetting(s)}
                    className="font-sans text-xs px-2.5 py-1 border transition-all"
                    style={setting===s ? chipActive : chipInactive}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-sans text-xs tracking-widest uppercase block mb-1" style={S.hint}>Theme</label>
              <div className="flex flex-wrap gap-1.5">
                {THEMES.map(t=>(
                  <button key={t} onClick={()=>setTheme(t)}
                    className="font-sans text-xs px-2.5 py-1 border transition-all"
                    style={theme===t ? chipActive : chipInactive}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate */}
      {mode==='generate' && (
        <>
          <button onClick={handleGenerate} disabled={loading}
            className="font-sans text-xs tracking-widest uppercase px-8 py-3 font-bold transition-colors disabled:opacity-40"
            style={{background:'#D4AF37',color:'#0B1628'}}>
            {loading ? 'Writing...' : 'Generate Story →'}
          </button>
          {errorMsg && <div className="mt-4 p-3 font-sans text-sm" style={{border:'1px solid rgba(220,38,38,0.3)',color:'#f87171'}}>{errorMsg}</div>}
          {story && (
            <div className="mt-8 p-6" style={S.border}>
              <p className="font-sans text-xs tracking-widest uppercase mb-4" style={S.label}>Generated Story</p>
              <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap" style={S.page}>{story}</div>
              <button onClick={()=>{setCurrentDraft(story);setMode('feedback')}}
                className="mt-4 font-sans text-xs tracking-widest transition-colors" style={{color:'#7A9CC0'}}>
                Get Feedback on this story →
              </button>
            </div>
          )}
        </>
      )}

      {/* Brainstorm */}
      {mode==='brainstorm' && (
        <>
          {brainstormHistory.length===0 ? (
            <button onClick={startBrainstorm}
              className="font-sans text-xs tracking-widest uppercase px-8 py-3 font-bold transition-colors"
              style={{background:'#D4AF37',color:'#0B1628'}}>Start Brainstorming →</button>
          ) : (
            <div style={S.border}>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {brainstormHistory.map((msg,i)=>(
                  <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
                    <div className="max-w-lg p-3 font-sans text-sm leading-relaxed"
                      style={msg.role==='user'
                        ? {background:'rgba(31,58,95,0.5)',color:'#F5ECD7',border:'1px solid rgba(31,58,95,0.6)'}
                        : {background:'rgba(17,32,64,0.7)',color:'#C8B99A',border:'1px solid #1A3358'}}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {brainstormLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 font-sans text-sm italic" style={{background:'rgba(17,32,64,0.7)',color:'#8A7A68',border:'1px solid #1A3358'}}>Thinking...</div>
                  </div>
                )}
              </div>
              <div className="flex" style={{borderTop:'1px solid #1A3358'}}>
                <input value={brainstormInput} onChange={e=>setBrainstormInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleBrainstorm(brainstormInput)}
                  placeholder="Type your response..."
                  className="flex-1 bg-transparent font-sans text-sm p-3 focus:outline-none"
                  style={{color:'#F5ECD7'}} />
                <button onClick={()=>handleBrainstorm(brainstormInput)} disabled={brainstormLoading}
                  className="font-sans text-xs px-4 transition-colors disabled:opacity-40"
                  style={{color:'#D4AF37',borderLeft:'1px solid #1A3358'}}>Send →</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Feedback */}
      {mode==='feedback' && (
        <div>
          <textarea value={currentDraft} onChange={e=>setCurrentDraft(e.target.value)}
            placeholder="Paste or write your story here to get feedback..."
            className="w-full h-48 font-sans text-sm p-4 resize-none focus:outline-none leading-relaxed mb-4"
            style={S.input} />
          <button onClick={handleFeedback} disabled={feedbackLoading||!currentDraft.trim()}
            className="font-sans text-xs tracking-widest uppercase px-8 py-3 font-bold transition-colors disabled:opacity-40"
            style={{background:'#D4AF37',color:'#0B1628'}}>
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
