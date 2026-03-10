import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp, AGE_GROUPS } from '../context/AppContext'

export default function Layout() {
  const { ageGroup, setAgeGroup, badges } = useApp()
  const earnedCount = badges.filter(b => b.earned).length
  const navigate = useNavigate()

  return (
    <div className="grain min-h-screen flex flex-col" style={{background:'#0B1628',color:'#F5ECD7'}}>

      {/* Top gold bar */}
      <div className="gold-bar" />

      {/* Header */}
      <header style={{borderBottom:'1px solid #1A3358'}}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Logo row */}
          <div className="flex items-center justify-between py-4">
            <button onClick={() => navigate('/')} className="text-left">
              <h1 className="font-serif text-2xl font-bold tracking-widest uppercase leading-none" style={{color:'#F5ECD7'}}>
                Shampoo
              </h1>
              <p className="font-sans text-xs tracking-widest uppercase mt-0.5" style={{color:'#D4AF37'}}>
                Creative Writing Academy
              </p>
            </button>

            {/* Age selector */}
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs tracking-widest uppercase mr-2 hidden sm:block" style={{color:'#8A7A68'}}>Age Group</span>
              {AGE_GROUPS.map(ag => (
                <button key={ag.value} onClick={() => setAgeGroup(ag.value)}
                  className="font-sans text-xs px-3 py-1.5 border tracking-wide transition-all"
                  style={ageGroup === ag.value
                    ? {borderColor:'#D4AF37', color:'#D4AF37', background:'rgba(212,175,55,0.1)'}
                    : {borderColor:'#1A3358', color:'#C8B99A'}
                  }>
                  {ag.label}
                </button>
              ))}
            </div>

            {/* Badge counter */}
            <button onClick={() => navigate('/badges')}
              className="flex items-center gap-2 px-3 py-1.5 transition-colors"
              style={{border:'1px solid #1A3358'}}>
              <span className="text-sm">🏆</span>
              <span className="font-sans text-xs" style={{color:'#C8B99A'}}>
                {earnedCount}/{badges.length} Badges
              </span>
            </button>
          </div>

          {/* Nav tabs */}
          <nav className="flex gap-0" style={{borderBottom:'none'}}>
            {[
              { to: '/upload-assess',    label: 'Upload & Assess' },
              { to: '/generate',         label: 'Generate & Brainstorm' },
              { to: '/literary-devices', label: 'Literary Devices' },
              { to: '/comprehension',    label: 'Comprehension' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `font-sans text-xs tracking-widest uppercase px-5 py-3 border-b-2 transition-colors ${
                    isActive ? 'border-gold text-gold' : 'border-transparent'
                  }`
                }
                style={({ isActive }) => isActive ? {color:'#D4AF37',borderColor:'#D4AF37'} : {color:'#C8B99A'}}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{borderTop:'1px solid #1A3358'}} className="py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="font-sans text-xs tracking-widest uppercase" style={{color:'#8A7A68'}}>Shampoo Academy</span>
          <div className="gold-bar w-24" />
          <span className="font-sans text-xs" style={{color:'#8A7A68'}}>Excellence in Creative Writing</span>
        </div>
      </footer>

    </div>
  )
}
