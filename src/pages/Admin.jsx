import { useState, useEffect, useCallback } from 'react'
import {
  getAll, updateById,
  setById, removeById,
} from '../lib/firebase'
import logger from '../lib/logger'

const TABS = [
  { id: 'dashboard', icon: 'fa-chart-pie', label: '대시보드' },
  { id: 'spots', icon: 'fa-map-pin', label: '관광지' },
  { id: 'users', icon: 'fa-users', label: '유저' },
  { id: 'tags', icon: 'fa-clock-rotate-left', label: '태그이력' },
  { id: 'coupons', icon: 'fa-ticket', label: '쿠폰' },
  { id: 'logs', icon: 'fa-bug', label: '로그' },
]

// ─── 반응형 CSS (미디어쿼리) ──────────────────────
const ADMIN_RESPONSIVE_CSS = `
@media (max-width: 640px) {
  .admin-layout { flex-direction: column !important; }
  .admin-sidebar {
    width: 100% !important; flex-direction: row !important;
    overflow-x: auto !important; padding: 10px 8px 0 !important;
    gap: 2px !important; -webkit-overflow-scrolling: touch;
  }
  .admin-sidebar .admin-brand { display: none !important; }
  .admin-side-btn {
    padding: 8px 12px !important; font-size: 11px !important;
    white-space: nowrap !important; border-radius: 8px 8px 0 0 !important;
    gap: 4px !important;
  }
  .admin-main { padding: 12px !important; max-height: none !important; }
  .admin-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
  .admin-stat-card { padding: 14px !important; gap: 10px !important; }
  .admin-stat-card .stat-icon { width: 36px !important; height: 36px !important; font-size: 14px !important; }
  .admin-stat-card .stat-value { font-size: 18px !important; }
  .admin-stat-card .stat-label { font-size: 10px !important; }
  .admin-panel-grid { grid-template-columns: 1fr !important; }
  .admin-table-wrap { overflow-x: auto !important; padding: 10px !important; }
  .admin-table-wrap table { min-width: 500px !important; }
  .admin-form-grid { grid-template-columns: 1fr !important; }
  .admin-toolbar { flex-wrap: wrap !important; gap: 8px !important; }
  .admin-toolbar-btns { flex-wrap: wrap !important; gap: 6px !important; }
  .admin-auth-card { width: 90% !important; padding: 30px 20px !important; }
}
`

// ─── 관리자 메인 ───────────────────────────────────
export default function Admin() {
  const [tab, setTab] = useState('dashboard')
  const [authd, setAuthd] = useState(false)
  const [pw, setPw] = useState('')

  // 간단한 관리자 인증 (프로토타입용)
  if (!authd) {
    return (
      <>
        <style>{ADMIN_RESPONSIVE_CSS}</style>
        <div className="admin-auth-wrap" style={S.authWrap}>
          <div className="admin-auth-card" style={S.authCard}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: 36, color: '#4A6CF7', marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A2E', marginBottom: 8 }}>관리자 로그인</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>TapGyeong 관리자 페이지</p>
            <input
              type="password" placeholder="관리자 비밀번호"
              value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (pw === 'tapgyeong2026' ? setAuthd(true) : alert('비밀번호가 틀렸습니다.'))}
              style={S.input}
            />
            <button
              onClick={() => pw === 'tapgyeong2026' ? setAuthd(true) : alert('비밀번호가 틀렸습니다.')}
              style={S.primaryBtn}
            >로그인</button>
            <p style={{ fontSize: 11, color: '#bbb', marginTop: 12 }}>힌트: tapgyeong2026</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{ADMIN_RESPONSIVE_CSS}</style>
      <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#F0F2F8' }}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={S.sidebar}>
          <div className="admin-brand" style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>TapGyeong</h1>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Admin Console</p>
          </div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="admin-side-btn" style={{
              ...S.sideBtn, background: tab === t.id ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.6)',
            }}>
              <i className={`fa-solid ${t.icon}`} style={{ width: 20, textAlign: 'center' }} />
              {t.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="admin-main" style={{ flex: 1, padding: 24, overflowY: 'auto', maxHeight: '100vh' }}>
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'spots' && <SpotsManager />}
          {tab === 'users' && <UsersManager />}
          {tab === 'tags' && <TagHistory />}
          {tab === 'coupons' && <CouponsManager />}
          {tab === 'logs' && <LogViewer />}
        </main>
      </div>
    </>
  )
}

// ─── 대시보드 ─────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentTags, setRecentTags] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [spots, users, stamps, tags, coupons, logs] = await Promise.all([
          getAll('tg_spots'),
          getAll('tg_users'),
          getAll('tg_stamps'),
          getAll('tg_tag_history'),
          getAll('tg_user_coupons'),
          getAll('tg_logs'),
        ])

        const unlocked = stamps.filter(s => s.unlocked).length
        const cities = {}
        tags.forEach(t => { cities[t.spot_city] = (cities[t.spot_city] || 0) + 1 })
        const errorLogs = logs.filter(l => l.level === 'error').length

        setStats({
          totalSpots: spots.length,
          totalUsers: users.length,
          totalTags: tags.length,
          unlockedStamps: unlocked,
          totalStamps: stamps.length,
          couponsUsed: coupons.filter(c => c.status === 'used').length,
          couponsTotal: coupons.length,
          errorCount: errorLogs,
          cityBreakdown: cities,
        })

        const sorted = [...tags].sort((a, b) => (b.tagged_at || '').localeCompare(a.tagged_at || ''))
        setRecentTags(sorted.slice(0, 10))
      } catch (err) {
        logger.error('ADMIN', '대시보드 로드 실패', err)
      }
    }
    load()
  }, [])

  if (!stats) return <Loading />

  const statCards = [
    { label: '관광지', value: stats.totalSpots, icon: 'fa-map-pin', color: '#4A6CF7' },
    { label: '전체 유저', value: stats.totalUsers, icon: 'fa-users', color: '#10B981' },
    { label: '총 태깅 수', value: stats.totalTags, icon: 'fa-tags', color: '#F59E0B' },
    { label: '해제 스탬프', value: `${stats.unlockedStamps}/${stats.totalStamps}`, icon: 'fa-stamp', color: '#8B5CF6' },
    { label: '쿠폰 사용', value: `${stats.couponsUsed}/${stats.couponsTotal}`, icon: 'fa-ticket', color: '#EC4899' },
    { label: '에러 로그', value: stats.errorCount, icon: 'fa-bug', color: '#EF4444' },
  ]

  return (
    <div>
      <h2 style={S.pageTitle}>대시보드</h2>
      <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((c, i) => (
          <div key={i} className="admin-stat-card" style={S.statCard}>
            <div className="stat-icon" style={{ ...S.statIcon, background: c.color + '15', color: c.color }}>
              <i className={`fa-solid ${c.icon}`} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>{c.value}</div>
              <div className="stat-label" style={{ fontSize: 12, color: '#888' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 도시별 태깅 분포 */}
      <div className="admin-panel-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={S.panel}>
          <h3 style={S.panelTitle}>도시별 태깅 분포</h3>
          {Object.entries(stats.cityBreakdown).map(([city, count]) => (
            <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, width: 40, color: '#1A1A2E' }}>{city}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#F0F2F8', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${Math.round((count / stats.totalTags) * 100)}%`,
                  background: city === '경주' ? '#FBBF24' : city === '안동' ? '#34D399' : '#F472B6',
                }} />
              </div>
              <span style={{ fontSize: 12, color: '#888', width: 30, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>

        <div style={S.panel}>
          <h3 style={S.panelTitle}>최근 태깅 이력</h3>
          {recentTags.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{t.spot_name}</span>
                <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{t.spot_city}</span>
              </div>
              <span style={{ fontSize: 11, color: '#aaa' }}>{formatDate(t.tagged_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 관광지 관리 ──────────────────────────────────
function SpotsManager() {
  const [spots, setSpots] = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | spot object
  const [form, setForm] = useState({ name: '', city: '경주', category: '문화유산', lat: '', lng: '', description: '' })

  const loadSpots = useCallback(async () => {
    const data = await getAll('tg_spots')
    setSpots(data.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)))
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadSpots() }, [loadSpots])

  function openNew() {
    setForm({ name: '', city: '경주', category: '문화유산', lat: '', lng: '', description: '' })
    setEditing('new')
  }

  function openEdit(spot) {
    setForm({ name: spot.name, city: spot.city, category: spot.category, lat: spot.lat || '', lng: spot.lng || '', description: spot.description || '' })
    setEditing(spot)
  }

  async function save() {
    const data = { ...form, lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 }
    try {
      if (editing === 'new') {
        const id = `spot-${Date.now()}`
        await setById('tg_spots', id, data)
        logger.info('ADMIN', `관광지 생성: ${data.name}`)
      } else {
        await updateById('tg_spots', editing.id, data)
        logger.info('ADMIN', `관광지 수정: ${data.name}`)
      }
      setEditing(null)
      loadSpots()
    } catch (err) {
      logger.error('ADMIN', '관광지 저장 실패', err)
      alert('저장 실패: ' + err.message)
    }
  }

  async function remove(spot) {
    if (!confirm(`"${spot.name}" 관광지를 삭제하시겠습니까?`)) return
    try {
      await removeById('tg_spots', spot.id)
      logger.info('ADMIN', `관광지 삭제: ${spot.name}`)
      loadSpots()
    } catch (err) {
      logger.error('ADMIN', '관광지 삭제 실패', err)
    }
  }

  const cityColors = { '경주': '#FBBF24', '안동': '#34D399', '포항': '#F472B6' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={S.pageTitle}>관광지 관리 ({spots.length})</h2>
        <button onClick={openNew} style={S.primaryBtn}>
          <i className="fa-solid fa-plus" style={{ marginRight: 6 }} /> 추가
        </button>
      </div>

      {editing && (
        <div style={{ ...S.panel, marginBottom: 20 }}>
          <h3 style={S.panelTitle}>{editing === 'new' ? '관광지 추가' : '관광지 수정'}</h3>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>이름</label>
              <input style={S.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>도시</label>
              <select style={S.input} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                <option>경주</option><option>안동</option><option>포항</option>
              </select>
            </div>
            <div>
              <label style={S.label}>카테고리</label>
              <select style={S.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['문화유산','전통마을','핫플레이스','관광단지','맛집','관광명소','전통시장','자연','역사거리'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>설명</label>
              <input style={S.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>위도 (lat)</label>
              <input style={S.input} type="number" step="0.0001" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>경도 (lng)</label>
              <input style={S.input} type="number" step="0.0001" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={save} style={S.primaryBtn}>저장</button>
            <button onClick={() => setEditing(null)} style={S.secondaryBtn}>취소</button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap" style={S.panel}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ID</th><th style={S.th}>이름</th><th style={S.th}>도시</th>
              <th style={S.th}>카테고리</th><th style={S.th}>좌표</th><th style={S.th}>작업</th>
            </tr>
          </thead>
          <tbody>
            {spots.map(s => (
              <tr key={s.id} style={S.tr}>
                <td style={S.td}><code style={{ fontSize: 11, color: '#888' }}>{s.id}</code></td>
                <td style={{ ...S.td, fontWeight: 600 }}>{s.name}</td>
                <td style={S.td}>
                  <span style={{ ...S.tag, background: (cityColors[s.city] || '#888') + '20', color: cityColors[s.city] || '#888' }}>
                    {s.city}
                  </span>
                </td>
                <td style={S.td}>{s.category}</td>
                <td style={{ ...S.td, fontSize: 11, color: '#888' }}>{s.lat?.toFixed(4)}, {s.lng?.toFixed(4)}</td>
                <td style={S.td}>
                  <button onClick={() => openEdit(s)} style={S.iconBtn} title="수정">
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button onClick={() => remove(s)} style={{ ...S.iconBtn, color: '#EF4444' }} title="삭제">
                    <i className="fa-solid fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 유저 관리 ────────────────────────────────────
function UsersManager() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    getAll('tg_users').then(setUsers).catch(() => {})
  }, [])

  return (
    <div>
      <h2 style={S.pageTitle}>유저 관리 ({users.length})</h2>
      <div className="admin-table-wrap" style={S.panel}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ID</th><th style={S.th}>닉네임</th><th style={S.th}>레벨</th>
              <th style={S.th}>총 태깅</th><th style={S.th}>방문 도시</th><th style={S.th}>맵 컬러링</th>
              <th style={S.th}>카카오 연동</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={S.tr}>
                <td style={S.td}><code style={{ fontSize: 11, color: '#888' }}>{u.id}</code></td>
                <td style={{ ...S.td, fontWeight: 600 }}>{u.nickname || '-'}</td>
                <td style={S.td}>Lv.{u.level || 1}</td>
                <td style={S.td}>{u.total_tags || 0}</td>
                <td style={S.td}>{(u.visited_cities || []).join(', ')}</td>
                <td style={S.td}>{u.map_coloring_pct || 0}%</td>
                <td style={S.td}>
                  {u.kakao_id ? (
                    <span style={{ ...S.tag, background: '#FEE50020', color: '#3C1E1E' }}>연동됨</span>
                  ) : (
                    <span style={{ ...S.tag, background: '#f0f0f0', color: '#888' }}>미연동</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 태그 이력 ────────────────────────────────────
function TagHistory() {
  const [tags, setTags] = useState([])
  const [filterCity, setFilterCity] = useState('all')

  useEffect(() => {
    getAll('tg_tag_history').then(data => {
      setTags(data.sort((a, b) => (b.tagged_at || '').localeCompare(a.tagged_at || '')))
    }).catch(() => {})
  }, [])

  const filtered = filterCity === 'all' ? tags : tags.filter(t => t.spot_city === filterCity)

  return (
    <div>
      <div className="admin-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={S.pageTitle}>태그 이력 ({filtered.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', '경주', '안동', '포항'].map(c => (
            <button key={c} onClick={() => setFilterCity(c)} style={{
              ...S.filterBtn, background: filterCity === c ? '#4A6CF7' : '#fff',
              color: filterCity === c ? '#fff' : '#666',
            }}>
              {c === 'all' ? '전체' : c}
            </button>
          ))}
        </div>
      </div>
      <div className="admin-table-wrap" style={S.panel}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>시간</th><th style={S.th}>유저</th><th style={S.th}>관광지</th>
              <th style={S.th}>도시</th><th style={S.th}>카테고리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id || i} style={S.tr}>
                <td style={{ ...S.td, fontSize: 12, color: '#888' }}>{formatDate(t.tagged_at)}</td>
                <td style={S.td}><code style={{ fontSize: 11 }}>{t.user_id}</code></td>
                <td style={{ ...S.td, fontWeight: 600 }}>{t.spot_name}</td>
                <td style={S.td}>{t.spot_city}</td>
                <td style={S.td}>{t.spot_category || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 쿠폰 관리 ───────────────────────────────────
function CouponsManager() {
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    getAll('tg_user_coupons').then(setCoupons).catch(() => {})
  }, [])

  async function toggleStatus(coupon) {
    const newStatus = coupon.status === 'available' ? 'used' : 'available'
    await updateById('tg_user_coupons', coupon.id, { status: newStatus })
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: newStatus } : c))
    logger.info('ADMIN', `쿠폰 상태 변경: ${coupon.title} → ${newStatus}`)
  }

  return (
    <div>
      <h2 style={S.pageTitle}>쿠폰 관리 ({coupons.length})</h2>
      <div className="admin-table-wrap" style={S.panel}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>제목</th><th style={S.th}>할인</th><th style={S.th}>유저</th>
              <th style={S.th}>상태</th><th style={S.th}>만료일</th><th style={S.th}>작업</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} style={S.tr}>
                <td style={{ ...S.td, fontWeight: 600 }}>{c.title}</td>
                <td style={S.td}>{c.discount}</td>
                <td style={S.td}><code style={{ fontSize: 11 }}>{c.user_id}</code></td>
                <td style={S.td}>
                  <span style={{
                    ...S.tag,
                    background: c.status === 'available' ? '#10B98120' : '#EF444420',
                    color: c.status === 'available' ? '#10B981' : '#EF4444',
                  }}>
                    {c.status === 'available' ? '사용 가능' : '사용 완료'}
                  </span>
                </td>
                <td style={{ ...S.td, fontSize: 12, color: '#888' }}>{c.expiry_date}</td>
                <td style={S.td}>
                  <button onClick={() => toggleStatus(c)} style={S.iconBtn} title="상태 변경">
                    <i className={`fa-solid ${c.status === 'available' ? 'fa-ban' : 'fa-rotate-left'}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 로그 뷰어 ───────────────────────────────────
function LogViewer() {
  const [logs, setLogs] = useState([])
  const [filterLevel, setFilterLevel] = useState('all')
  const [source, setSource] = useState('firestore') // 'memory' | 'firestore'

  const loadLogs = useCallback(async () => {
    if (source === 'memory') {
      setLogs(logger.getLogs().reverse())
    } else {
      try {
        const data = await getAll('tg_logs')
        setLogs(data.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')))
      } catch (err) {
        console.error('로그 로드 실패', err)
      }
    }
  }, [source])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs()
  }, [loadLogs])

  const filtered = filterLevel === 'all' ? logs : logs.filter(l => l.level === filterLevel)

  const levelColors = { info: '#4A6CF7', warn: '#F59E0B', error: '#EF4444' }

  return (
    <div>
      <div className="admin-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={S.pageTitle}>에러 로그 ({filtered.length})</h2>
        <div className="admin-toolbar-btns" style={{ display: 'flex', gap: 8 }}>
          <select value={source} onChange={e => setSource(e.target.value)} style={{ ...S.input, width: 'auto', padding: '6px 12px' }}>
            <option value="firestore">Firestore 로그</option>
            <option value="memory">메모리 로그</option>
          </select>
          {['all', 'error', 'warn', 'info'].map(l => (
            <button key={l} onClick={() => setFilterLevel(l)} style={{
              ...S.filterBtn, background: filterLevel === l ? (levelColors[l] || '#4A6CF7') : '#fff',
              color: filterLevel === l ? '#fff' : '#666',
            }}>
              {l === 'all' ? '전체' : l.toUpperCase()}
            </button>
          ))}
          <button onClick={loadLogs} style={S.secondaryBtn}>
            <i className="fa-solid fa-rotate" style={{ marginRight: 4 }} /> 새로고침
          </button>
        </div>
      </div>
      <div style={S.panel}>
        {filtered.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>로그가 없습니다</p>
        ) : (
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {filtered.map((log, i) => (
              <div key={i} style={{ ...S.logRow, borderLeft: `4px solid ${levelColors[log.level] || '#888'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      ...S.tag, fontSize: 10, padding: '2px 8px',
                      background: (levelColors[log.level] || '#888') + '20',
                      color: levelColors[log.level] || '#888',
                    }}>
                      {(log.level || '').toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4A6CF7' }}>[{log.category}]</span>
                    <span style={{ fontSize: 13, color: '#1A1A2E' }}>{log.message}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{formatDate(log.timestamp)}</span>
                </div>
                {log.data && (
                  <pre style={{ fontSize: 11, color: '#666', background: '#F8F8FC', padding: 8, borderRadius: 6, margin: '4px 0 0', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 공통 컴포넌트 ────────────────────────────────
function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#4A6CF7' }} />
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

// ─── 스타일 ──────────────────────────────────────
const S = {
  authWrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #1E3A8A 0%, #4A6CF7 60%, #7DD3FC 100%)',
  },
  authCard: {
    background: '#fff', borderRadius: 24, padding: '40px 32px', textAlign: 'center',
    width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  sidebar: {
    width: 200, background: '#1E293B', display: 'flex', flexDirection: 'column',
  },
  sideBtn: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
    border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    width: '100%', textAlign: 'left', transition: 'background 0.2s',
  },
  pageTitle: { fontSize: 20, fontWeight: 800, color: '#1A1A2E', margin: 0 },
  panel: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#1A1A2E', marginBottom: 14, margin: '0 0 14px' },
  statCard: {
    background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'center', gap: 14,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 18,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#888', borderBottom: '2px solid #f0f0f0' },
  td: { padding: '10px 12px', fontSize: 13, color: '#1A1A2E', borderBottom: '1px solid #f5f5f5' },
  tr: { transition: 'background 0.1s' },
  tag: { padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, display: 'inline-block' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid #E0E0EE',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  label: { fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 },
  primaryBtn: {
    padding: '10px 20px', borderRadius: 10, border: 'none',
    background: '#4A6CF7', color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
  },
  secondaryBtn: {
    padding: '10px 20px', borderRadius: 10, border: '2px solid #E0E0EE',
    background: '#fff', color: '#666', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
  },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
    fontSize: 13, color: '#4A6CF7', borderRadius: 6,
  },
  filterBtn: {
    padding: '6px 14px', borderRadius: 8, border: '1px solid #E0E0EE',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  logRow: {
    padding: '10px 14px', marginBottom: 8, borderRadius: 8, background: '#FAFBFF',
  },
}
