import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp, AGE_GROUPS } from '../context/AppContext'

export default function Layout() {
  const { ageGroup, setAgeGroup, badges } = useApp()
  const earnedCount = badges.filter(b => b.earned).length
  const navigate = useNavigate()

  return (
    <div className="grain min-h-screen flex flex-col bg-graphite">

      {/* Top gold accent bar */}
      <div className="gold-bar" />

      {/* Header */}
      <header className="border-b border-g800">
        <div className="max-w-7xl mx-auto px-6">

          {/* Top row: logo + age selector + badges */}
          <div className="flex items-center justify-between py-4">
            <button onClick={() => navigate('/')} className="text-left">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-silver tracking-widest uppercase leading-none">
                    Shampoo
                  </h1>
                  <p className="font-sans text-xs tracking-widest text-gold uppercase mt-0.5">
                    Creative Writing Academy
                  </p>
                </div>
              </div>
            </button>

            {/* Age selector — persistent */}
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-g600 tracking-widest uppercase mr-2 hidden sm:block">Age Group</span>
              {AGE_GROUPS.map(ag => (
                <button
                  key={ag.value}
                  onClick={() => setAgeGroup(ag.value)}
                  className={`font-sans text-xs px-3 py-1.5 border tracking-wide transition-all ${
                    ageGroup === ag.value
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-g800 text-g600 hover:border-g700 hover:text-silver'
                  }`}
                >
                  {ag.label}
                </button>
              ))}
            </div>

            {/* Badge counter */}
            <button
              onClick={() => navigate('/badges')}
              className="flex items-center gap-2 border border-g800 px-3 py-1.5 hover:border-gold transition-colors group"
            >
              <span className="text-sm">🏆</span>
              <span className="font-sans text-xs text-g600 group-hover:text-gold transition-colors">
                {earnedCount}/{badges.length} Badges
              </span>
            </button>
          </div>

          {/* Nav tabs */}
          <nav className="flex gap-0 -mb-px">
            {[
              { to: '/upload-assess',     label: 'Upload & Assess' },
              { to: '/generate',          label: 'Generate & Brainstorm' },
              { to: '/literary-devices',  label: 'Literary Devices' },
              { to: '/comprehension',     label: 'Comprehension' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `font-sans text-xs tracking-widest uppercase px-5 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-gold text-gold'
                      : 'border-transparent text-g600 hover:text-silver'
                  }`
                }
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
      <footer className="border-t border-g800 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="font-sans text-xs text-g600 tracking-widest uppercase">Shampoo Academy</span>
          <div className="gold-bar w-24" />
          <span className="font-sans text-xs text-g600">Excellence in Creative Writing</span>
        </div>
      </footer>

    </div>
  )
}
