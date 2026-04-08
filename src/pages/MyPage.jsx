import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

const EMOJI_MAP = {
  '문화유산': '🏛️',
  '자연경관': '🌅',
  '체험': '☕',
  '맛집': '🍜',
}

function getRelativeTime(taggedAt) {
  const now = new Date()
  const tagged = new Date(taggedAt)
  const diffMs = now - tagged
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  return tagged.toLocaleDateString('ko-KR')
}

export default function MyPage() {
  const navigate = useNavigate()
  const [notiEnabled, setNotiEnabled] = useState(true)
  const [user, setUser] = useState(null)
  const [visits, setVisits] = useState([])
  const [stampCount, setStampCount] = useState(0)
  const [gyeongjuStamps, setGyeongjuStamps] = useState({ done: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('tg_users')
          .select('*')
          .eq('id', DEMO_USER_ID)
          .single()

        if (userError) throw userError
        setUser(userData)

        // Fetch recent visits
        const { data: visitData, error: visitError } = await supabase
          .from('tg_tag_history')
          .select('*, tg_spots(name, city, category)')
          .eq('user_id', DEMO_USER_ID)
          .order('tagged_at', { ascending: false })
          .limit(5)

        if (visitError) throw visitError
        const visitsWithTime = (visitData || []).map((v) => ({
          name: v.tg_spots?.name || '알 수 없음',
          city: v.tg_spots?.city || '',
          time: getRelativeTime(v.tagged_at),
          emoji: EMOJI_MAP[v.tg_spots?.category] || '📍',
        }))
        setVisits(visitsWithTime)

        // Fetch stamp count
        const { count, error: stampError } = await supabase
          .from('tg_stamps')
          .select('id', { count: 'exact' })
          .eq('user_id', DEMO_USER_ID)
          .eq('unlocked', true)

        if (stampError) throw stampError
        setStampCount(count || 0)

        // Fetch gyeongju stamp progress
        const { data: allStamps } = await supabase
          .from('tg_stamps')
          .select('*, tg_spots(city)')
          .eq('user_id', DEMO_USER_ID)
          .eq('unlocked', true)
        const { count: gyeongjuTotal } = await supabase
          .from('tg_spots')
          .select('id', { count: 'exact' })
          .eq('city', '경주')
        const gjDone = (allStamps || []).filter(s => s.tg_spots?.city === '경주').length
        setGyeongjuStamps({ done: gjDone, total: gyeongjuTotal || 0 })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = [
    { icon: 'fa-tags', value: user?.total_tags?.toString() || '0', label: '총 태그', bg: '#EBF0FF', color: '#4A6CF7' },
    { icon: 'fa-city', value: user?.visited_cities?.toString() || '0', label: '방문 도시', bg: '#ECFDF5', color: '#10B981' },
    { icon: 'fa-map', value: `${user?.map_coloring_pct || 0}%`, label: '맵컬러링', bg: '#FEF3C7', color: '#F59E0B' },
    { icon: 'fa-award', value: stampCount.toString(), label: '보유 스탬프', bg: '#FCE7F3', color: '#EC4899' },
  ]

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Profile Header */}
      <div style={styles.header}>
        <div style={styles.headerBg} />
        <div style={styles.profileSection}>
          <div style={styles.avatar}>
            <i className="fa-solid fa-user" style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <h1 style={styles.userName}>{user?.nickname || '사용자'}</h1>
          <div style={styles.levelBadge}>
            <i className="fa-solid fa-star" style={{ fontSize: 11, color: '#F59E0B' }} /> 경북탐험 Lv.{user?.level || '?'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: s.bg }}>
              <i className={`fa-solid ${s.icon}`} style={{ fontSize: 16, color: s.color }} />
            </div>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Visits */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
            최근 방문 기록
          </h2>
          <button style={styles.moreBtn}>
            전체보기 <i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }} />
          </button>
        </div>
        {visits.map((v, i) => (
          <div key={i} style={{ ...styles.visitItem, borderBottom: i < visits.length - 1 ? '1px solid #F0F2F8' : 'none' }}>
            <div style={styles.visitEmoji}>{v.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.visitName}>{v.name}</div>
              <div style={styles.visitMeta}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: 9, color: '#A0A0B8' }} /> {v.city}
              </div>
            </div>
            <div style={styles.visitTime}>{v.time}</div>
          </div>
        ))}
      </div>

      {/* Stamp Tour CTA */}
      <div style={styles.ctaCard}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            <i className="fa-solid fa-medal" style={{ marginRight: 4 }} /> 스탬프 투어 진행 중!
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            경주 {gyeongjuStamps.total}곳 중 {gyeongjuStamps.done}곳 완료 — {Math.max(0, gyeongjuStamps.total - gyeongjuStamps.done)}곳 남았어요
          </div>
        </div>
        <div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{gyeongjuStamps.done}/{gyeongjuStamps.total}</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div style={styles.card}>
        <h2 style={{ ...styles.cardTitle, marginBottom: 12 }}>
          <i className="fa-solid fa-gear" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
          설정
        </h2>

        <div style={styles.settingItem}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fa-solid fa-bell" style={{ fontSize: 16, color: '#4A4A6A' }} />
            <span style={{ fontSize: 14, color: '#1A1A2E' }}>알림 설정</span>
          </div>
          <button
            onClick={() => setNotiEnabled(!notiEnabled)}
            style={{ ...styles.toggle, background: notiEnabled ? '#4A6CF7' : '#D0D0E0' }}
          >
            <div style={{ ...styles.toggleDot, transform: notiEnabled ? 'translateX(18px)' : 'translateX(2px)' }} />
          </button>
        </div>

        <div style={styles.settingItem}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fa-solid fa-user-gear" style={{ fontSize: 16, color: '#4A4A6A' }} />
            <span style={{ fontSize: 14, color: '#1A1A2E' }}>계정 정보</span>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 14, color: '#C0C0D0' }} />
        </div>

        <div style={styles.settingItem} onClick={() => {
          localStorage.removeItem('tg_user')
          localStorage.removeItem('tg_logged_in')
          localStorage.removeItem('tg_kakao_token')
          navigate('/login')
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 16, color: '#EF4444' }} />
            <span style={{ fontSize: 14, color: '#EF4444' }}>로그아웃</span>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}

const styles = {
  header: { position: 'relative', paddingBottom: 20 },
  headerBg: {
    height: 140,
    background: 'linear-gradient(160deg, #1E3A8A 0%, #4A6CF7 40%, #7DD3FC 100%)',
    borderRadius: '0 0 24px 24px',
  },
  profileSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -40 },
  avatar: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A6CF7, #60A5FA)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '4px solid #fff', boxShadow: '0 4px 16px rgba(74,108,247,0.3)',
  },
  userName: { fontSize: 20, fontWeight: 700, color: '#1A1A2E', marginTop: 10 },
  levelBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#FEF3C7', color: '#B45309', fontSize: 12, fontWeight: 600,
    padding: '4px 12px', borderRadius: 12, marginTop: 6,
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
    padding: '0 16px', marginTop: 4, marginBottom: 16,
  },
  statCard: { background: '#fff', borderRadius: 14, padding: '14px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
  },
  statValue: { fontSize: 18, fontWeight: 700, color: '#1A1A2E' },
  statLabel: { fontSize: 10, color: '#8888A8', marginTop: 2 },
  card: { background: '#fff', borderRadius: 16, margin: '0 16px 12px', padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A2E', display: 'flex', alignItems: 'center' },
  moreBtn: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4A6CF7', fontWeight: 500, background: 'none' },
  visitItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' },
  visitEmoji: {
    width: 40, height: 40, borderRadius: 12, background: '#F8F9FE',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
  visitName: { fontSize: 14, fontWeight: 600, color: '#1A1A2E' },
  visitMeta: { fontSize: 11, color: '#A0A0B8', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 },
  visitTime: { fontSize: 11, color: '#A0A0B8' },
  ctaCard: {
    background: 'linear-gradient(135deg, #4A6CF7, #60A5FA)', borderRadius: 16,
    margin: '0 16px 12px', padding: '16px 20px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  },
  settingItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: '1px solid #F5F5FA',
  },
  toggle: { width: 44, height: 26, borderRadius: 13, position: 'relative', transition: 'background 0.2s', padding: 0 },
  toggleDot: {
    width: 22, height: 22, borderRadius: '50%', background: '#fff',
    position: 'absolute', top: 2, transition: 'transform 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  },
}
