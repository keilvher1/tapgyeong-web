import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', icon: 'fa-house', label: '홈' },
  { path: '/ai', icon: 'fa-robot', label: 'AI추천' },
  { path: '/tag', icon: 'fa-wifi', label: 'NFC', center: true },
  { path: '/explore', icon: 'fa-map', label: '탐험' },
  { path: '/coupon', icon: 'fa-ticket', label: '쿠폰' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={styles.nav}>
      {tabs.map(t => {
        const active = pathname === t.path
        if (t.center) {
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              style={styles.centerTab}
            >
              <i className={`fa-solid ${t.icon}`} style={{ fontSize: 22, color: '#fff', transform: 'rotate(90deg)' }} />
            </button>
          )
        }
        return (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              ...styles.tab,
              color: active ? '#4A6CF7' : '#A0A0B8',
            }}
          >
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: 20 }} />
            <span style={{ fontSize: 10, marginTop: 3, fontWeight: active ? 600 : 400 }}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    height: 68,
    background: '#fff',
    borderTop: '1px solid #EEEEF2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 100,
    boxShadow: '0 -2px 16px rgba(0,0,0,0.04)',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    padding: '6px 12px',
    gap: 0,
    transition: 'color 0.2s',
  },
  centerTab: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)',
    border: '3px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: -20, boxShadow: '0 4px 14px rgba(74,108,247,0.35)',
    cursor: 'pointer',
  },
}
