import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { db, DEMO_USER_ID, getAll, getFiltered, getById, countDocs, where, orderBy, limit } from '../lib/firebase'
import {
  BlurFade, AnimatedGradientText, SparklesText, NumberTicker,
  AnimatedProgress, MagicCard, StaggerContainer, StaggerItem,
  Particles, NeonGradientCard, ShimmerButton, ShineBorder
} from '../components/magicui'

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
        const userData = await getById('tg_users', DEMO_USER_ID)
        if (!userData) throw new Error('User not found')
        setUser(userData)

        const visitData = await getFiltered('tg_tag_history',
          where('user_id', '==', DEMO_USER_ID),
          orderBy('tagged_at', 'desc'),
          limit(5)
        )
        const visitsWithTime = (visitData || []).map((v) => ({
          name: v.spot_name || '알 수 없음',
          city: v.spot_city || '',
          time: getRelativeTime(v.tagged_at),
          emoji: EMOJI_MAP[v.spot_category] || '📍',
        }))
        setVisits(visitsWithTime)

        const unlockedStamps = await getFiltered('tg_stamps',
          where('user_id', '==', DEMO_USER_ID),
          where('unlocked', '==', true)
        )
        setStampCount(unlockedStamps.length)

        const gjDone = unlockedStamps.filter(s => s.spot_city === '경주').length
        const gyeongjuTotal = await countDocs('tg_spots', where('city', '==', '경주'))
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
    { icon: 'fa-tags', value: user?.total_tags || 0, label: '총 태그', bg: '#EBF0FF', color: '#4A6CF7' },
    { icon: 'fa-city', value: user?.visited_cities?.length || 0, label: '방문 도시', bg: '#ECFDF5', color: '#10B981' },
    { icon: 'fa-map', value: user?.map_coloring_pct || 0, label: '맵컬러링', bg: '#FEF3C7', color: '#F59E0B', suffix: '%' },
    { icon: 'fa-award', value: stampCount, label: '보유 스탬프', bg: '#FCE7F3', color: '#EC4899' },
  ]

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Profile Header */}
      <div style={styles.header}>
        <div style={styles.headerBg}>
          <Particles count={25} color="rgba(255,255,255,0.3)" />
        </div>
        <div style={styles.profileSection}>
          <BlurFade delay={0.1}>
            <motion.div
              style={styles.avatar}
              whileHover={{ scale: 1.08, rotate: 5 }}
              animate={{ boxShadow: ['0 4px 16px rgba(74,108,247,0.3)', '0 4px 24px rgba(74,108,247,0.5)', '0 4px 16px rgba(74,108,247,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <i className="fa-solid fa-user" style={{ fontSize: 28, color: '#fff' }} />
            </motion.div>
          </BlurFade>
          <BlurFade delay={0.2}>
            <h1 style={styles.userName}>{user?.nickname || '사용자'}</h1>
          </BlurFade>
          <BlurFade delay={0.3}>
            <motion.div
              style={styles.levelBadge}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <i className="fa-solid fa-star" style={{ fontSize: 11, color: '#F59E0B' }} /> 경북탐험 Lv.{user?.level || '?'}
            </motion.div>
          </BlurFade>
        </div>
      </div>

      {/* Stats Grid */}
      <StaggerContainer staggerDelay={0.1} style={styles.statsGrid}>
        {stats.map((s, i) => (
          <StaggerItem key={i}>
            <MagicCard style={{ padding: '14px 8px', textAlign: 'center' }} glowColor={`${s.color}15`}>
              <motion.div
                style={{ ...styles.statIcon, background: s.bg }}
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <i className={`fa-solid ${s.icon}`} style={{ fontSize: 16, color: s.color }} />
              </motion.div>
              <div style={styles.statValue}>
                <NumberTicker value={s.value} style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }} suffix={s.suffix || ''} />
              </div>
              <div style={styles.statLabel}>{s.label}</div>
            </MagicCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Recent Visits */}
      <BlurFade delay={0.2}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <SparklesText style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E' }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
                최근 방문 기록
              </SparklesText>
            </h2>
            <motion.button
              style={styles.moreBtn}
              whileHover={{ x: 3 }}
            >
              전체보기 <i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }} />
            </motion.button>
          </div>
          {visits.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{ ...styles.visitItem, borderBottom: i < visits.length - 1 ? '1px solid #F0F2F8' : 'none' }}
            >
              <motion.div
                style={styles.visitEmoji}
                whileHover={{ scale: 1.15, rotate: 10 }}
              >
                {v.emoji}
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={styles.visitName}>{v.name}</div>
                <div style={styles.visitMeta}>
                  <i className="fa-solid fa-location-dot" style={{ fontSize: 9, color: '#A0A0B8' }} /> {v.city}
                </div>
              </div>
              <div style={styles.visitTime}>{v.time}</div>
            </motion.div>
          ))}
        </div>
      </BlurFade>

      {/* Stamp Tour CTA */}
      <BlurFade delay={0.3}>
        <NeonGradientCard
          borderRadius={16}
          neonColors={['#4A6CF7', '#60A5FA']}
          style={{ margin: '0 16px 12px', padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>
                <motion.i
                  className="fa-solid fa-medal"
                  style={{ marginRight: 4, color: '#4A6CF7' }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                스탬프 투어 진행 중!
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                경주 {gyeongjuStamps.total}곳 중 <NumberTicker value={gyeongjuStamps.done} style={{ fontSize: 12, fontWeight: 700, color: '#4A6CF7' }} />곳 완료
              </div>
              <AnimatedProgress
                value={gyeongjuStamps.done}
                max={gyeongjuStamps.total || 1}
                color="#4A6CF7"
                height={6}
                style={{ marginTop: 8 }}
              />
            </div>
            <motion.div
              style={{
                width: 52, height: 52, borderRadius: '50%',
                border: '3px solid #4A6CF7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(74,108,247,0.05)',
              }}
              animate={{ borderColor: ['#4A6CF7', '#7DD3FC', '#4A6CF7'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4A6CF7' }}>
                <NumberTicker value={gyeongjuStamps.done} style={{ fontSize: 13, fontWeight: 700, color: '#4A6CF7' }} />
                /{gyeongjuStamps.total}
              </span>
            </motion.div>
          </div>
        </NeonGradientCard>
      </BlurFade>

      {/* Settings */}
      <BlurFade delay={0.4}>
        <div style={styles.card}>
          <h2 style={{ ...styles.cardTitle, marginBottom: 12 }}>
            <i className="fa-solid fa-gear" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
            설정
          </h2>

          <motion.div style={styles.settingItem} whileHover={{ x: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-bell" style={{ fontSize: 16, color: '#4A4A6A' }} />
              <span style={{ fontSize: 14, color: '#1A1A2E' }}>알림 설정</span>
            </div>
            <motion.button
              onClick={() => setNotiEnabled(!notiEnabled)}
              style={{ ...styles.toggle, background: notiEnabled ? '#4A6CF7' : '#D0D0E0' }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                style={styles.toggleDot}
                animate={{ x: notiEnabled ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </motion.div>

          <motion.div style={styles.settingItem} whileHover={{ x: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-user-gear" style={{ fontSize: 16, color: '#4A4A6A' }} />
              <span style={{ fontSize: 14, color: '#1A1A2E' }}>계정 정보</span>
            </div>
            <motion.i
              className="fa-solid fa-chevron-right"
              style={{ fontSize: 14, color: '#C0C0D0' }}
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            style={styles.settingItem}
            whileHover={{ x: 2 }}
            onClick={() => {
              localStorage.removeItem('tg_user')
              localStorage.removeItem('tg_logged_in')
              localStorage.removeItem('tg_kakao_token')
              navigate('/login')
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 16, color: '#EF4444' }} />
              <span style={{ fontSize: 14, color: '#EF4444' }}>로그아웃</span>
            </div>
          </motion.div>
        </div>
      </BlurFade>

      <div style={{ height: 24 }} />
    </div>
  )
}

const styles = {
  header: { position: 'relative', paddingBottom: 20 },
  headerBg: {
    height: 140,
    background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 30%, #4A6CF7 60%, #7DD3FC 100%)',
    borderRadius: '0 0 24px 24px',
    position: 'relative', overflow: 'hidden',
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
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
  },
  statValue: { fontSize: 18, fontWeight: 700, color: '#1A1A2E' },
  statLabel: { fontSize: 10, color: '#8888A8', marginTop: 2 },
  card: { background: '#fff', borderRadius: 16, margin: '0 16px 12px', padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A2E', display: 'flex', alignItems: 'center' },
  moreBtn: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4A6CF7', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' },
  visitItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' },
  visitEmoji: {
    width: 40, height: 40, borderRadius: 12, background: '#F8F9FE',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
  visitName: { fontSize: 14, fontWeight: 600, color: '#1A1A2E' },
  visitMeta: { fontSize: 11, color: '#A0A0B8', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 },
  visitTime: { fontSize: 11, color: '#A0A0B8' },
  settingItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: '1px solid #F5F5FA',
  },
  toggle: { width: 44, height: 26, borderRadius: 13, position: 'relative', transition: 'background 0.2s', padding: 0, border: 'none', cursor: 'pointer' },
  toggleDot: {
    width: 22, height: 22, borderRadius: '50%', background: '#fff',
    position: 'absolute', top: 2,
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  },
}
