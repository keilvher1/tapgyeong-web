import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import KakaoMap from '../components/KakaoMap'
import { db, DEMO_USER_ID, getAll, getFiltered, getById, where } from '../lib/firebase'
import {
  BlurFade, AnimatedGradientText, SparklesText, NumberTicker,
  AnimatedProgress, MagicCard, StaggerContainer, StaggerItem,
  Particles, BorderBeam, NeonGradientCard, ShineBorder
} from '../components/magicui'

export default function ExploreMap() {
  const [selectedCity, setSelectedCity] = useState('all')
  const [cities, setCities] = useState([
    { name: '경주', key: 'gyeongju', progress: 25, color: '#FBBF24', total: 20, visited: 5, center: { lat: 35.83, lng: 129.22 } },
    { name: '안동', key: 'andong', progress: 19, color: '#34D399', total: 16, visited: 3, center: { lat: 36.57, lng: 128.73 } },
    { name: '포항', key: 'pohang', progress: 4, color: '#F472B6', total: 12, visited: 0, center: { lat: 36.04, lng: 129.37 } },
  ])
  const [stamps, setStamps] = useState([
    { name: '불국사', unlocked: true, emoji: '🏛️' },
    { name: '석굴암', unlocked: true, emoji: '🗿' },
    { name: '첨성대', unlocked: true, emoji: '🔭' },
    { name: '안압지', unlocked: true, emoji: '🌙' },
    { name: '하회마을', unlocked: true, emoji: '🏘️' },
    { name: '도산서원', unlocked: false, emoji: '📚' },
    { name: '호미곶', unlocked: false, emoji: '🌅' },
    { name: '영일대', unlocked: false, emoji: '🏖️' },
    { name: '죽도시장', unlocked: false, emoji: '🐟' },
  ])
  const [leaderboard, setLeaderboard] = useState({ score: 0, rank_title: '탐험가' })

  const emojiMap = {
    '문화유산': '🏛️',
    '자연경관': '🌅',
    '체험': '🎭',
    '맛집': '🍜',
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const spots = await getAll('tg_spots')
        const userStamps = await getFiltered('tg_stamps', where('user_id', '==', DEMO_USER_ID))
        const leaderData = await getById('tg_leaderboard', DEMO_USER_ID)

        const unlockedSpotIds = new Set((userStamps || []).map(s => s.spot_id))
        const processedStamps = (spots || []).map(spot => ({
          name: spot.name,
          unlocked: unlockedSpotIds.has(spot.id),
          emoji: emojiMap[spot.category] || '📍',
        }))
        setStamps(processedStamps)

        const cityMap = {}
        const cityDefaults = {
          '경주': { color: '#FBBF24', center: { lat: 35.83, lng: 129.22 }, key: 'gyeongju' },
          '안동': { color: '#34D399', center: { lat: 36.57, lng: 128.73 }, key: 'andong' },
          '포항': { color: '#F472B6', center: { lat: 36.04, lng: 129.37 }, key: 'pohang' },
        }

        spots?.forEach(spot => {
          if (!cityMap[spot.city]) cityMap[spot.city] = { total: 0, visited: 0 }
          cityMap[spot.city].total += 1
        })

        userStamps?.forEach(stamp => {
          const city = stamp.spot_city
          if (city && cityMap[city]) cityMap[city].visited += 1
        })

        const updatedCities = Object.entries(cityMap).map(([cityName, data]) => ({
          name: cityName,
          ...cityDefaults[cityName],
          total: data.total,
          visited: data.visited,
          progress: data.total > 0 ? Math.round((data.visited / data.total) * 100) : 0,
        }))
        setCities(updatedCities)

        if (leaderData) setLeaderboard(leaderData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const getMapProps = () => {
    const city = cities.find(c => c.key === selectedCity)
    if (city) return { center: city.center, zoom: 8, markers: city.key }
    return { center: { lat: 36.1, lng: 129.0 }, zoom: 10, markers: 'all' }
  }

  const mapProps = getMapProps()
  const totalVisited = cities.reduce((a, c) => a + c.visited, 0)
  const totalSpots = cities.reduce((a, c) => a + c.total, 0)

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Hero Header */}
      <div style={styles.header}>
        <Particles count={25} color="rgba(255,255,255,0.4)" />
        <BlurFade delay={0.1}>
          <i className="fa-solid fa-map-location-dot" style={{ fontSize: 20, color: '#fff' }} />
        </BlurFade>
        <BlurFade delay={0.2}>
          <AnimatedGradientText
            colors={['#fff', '#7DD3FC', '#A78BFA', '#fff']}
            style={{ fontSize: 22, fontWeight: 800, display: 'block' }}
          >
            경북 탐험 현황
          </AnimatedGradientText>
        </BlurFade>
        <BlurFade delay={0.3}>
          <p style={styles.subtitle}>방문한 관광지가 지도에 표시됩니다</p>
        </BlurFade>
        {/* Mini stats in header */}
        <BlurFade delay={0.4}>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={styles.headerStat}>
              <NumberTicker value={totalVisited} style={{ fontSize: 20, fontWeight: 800, color: '#fff' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>방문 완료</span>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div style={styles.headerStat}>
              <NumberTicker value={totalSpots} style={{ fontSize: 20, fontWeight: 800, color: '#fff' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>전체 관광지</span>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div style={styles.headerStat}>
              <NumberTicker
                value={totalSpots > 0 ? Math.round((totalVisited / totalSpots) * 100) : 0}
                suffix="%"
                style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}
              />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>달성률</span>
            </div>
          </div>
        </BlurFade>
      </div>

      {/* City Progress */}
      <div style={styles.section}>
        <BlurFade delay={0.2}>
          <h2 style={styles.sectionTitle}>
            <SparklesText style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E' }}>
              <i className="fa-solid fa-chart-simple" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
              도시별 탐험 진행률
            </SparklesText>
          </h2>
        </BlurFade>
        <StaggerContainer staggerDelay={0.12}>
          {cities.map((c, i) => (
            <StaggerItem key={i}>
              <MagicCard
                style={{
                  padding: 14, marginBottom: 10, cursor: 'pointer',
                  border: selectedCity === c.key ? `2px solid ${c.color}` : '2px solid transparent',
                }}
                glowColor={`${c.color}20`}
              >
                <div onClick={() => setSelectedCity(selectedCity === c.key ? 'all' : c.key)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <motion.div
                        style={{ ...styles.cityDot, background: c.color }}
                        animate={selectedCity === c.key ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: '#A0A0B8' }}>
                        <NumberTicker value={c.visited} style={{ fontSize: 11, color: '#A0A0B8' }} />/{c.total}곳
                      </span>
                    </div>
                    <NumberTicker
                      value={c.progress}
                      suffix="%"
                      style={{ fontSize: 15, fontWeight: 700, color: c.color }}
                    />
                  </div>
                  <AnimatedProgress value={c.progress} max={100} color={c.color} height={6} />
                </div>
              </MagicCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Real Kakao Map */}
      <div style={styles.section}>
        <BlurFade delay={0.3}>
          <h2 style={styles.sectionTitle}>
            <i className="fa-solid fa-earth-asia" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
            경북 지역 탐험 지도
          </h2>
        </BlurFade>
        <BlurFade delay={0.4}>
          <BorderBeam borderRadius={16} color1="#4A6CF7" color2="#7DD3FC" duration={5}>
            <KakaoMap
              key={selectedCity}
              height={320}
              center={mapProps.center}
              zoom={mapProps.zoom}
              markers={mapProps.markers}
            />
          </BorderBeam>
        </BlurFade>
      </div>

      {/* Digital Stamp Book */}
      <div style={styles.section}>
        <BlurFade delay={0.2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={styles.sectionTitle}>
              <SparklesText style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E' }}>
                <i className="fa-solid fa-stamp" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
                디지털 스탬프 북
              </SparklesText>
            </h2>
            <span style={{ fontSize: 12, color: '#4A6CF7', fontWeight: 600 }}>
              <NumberTicker value={stamps.filter(s => s.unlocked).length} style={{ fontSize: 12, color: '#4A6CF7', fontWeight: 600 }} />
              /{stamps.length}
            </span>
          </div>
        </BlurFade>
        <StaggerContainer staggerDelay={0.06} style={styles.stampGrid}>
          {stamps.map((s, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={s.unlocked ? { scale: 1.08, rotate: 2 } : {}}
                whileTap={s.unlocked ? { scale: 0.95 } : {}}
                style={{
                  ...styles.stampItem,
                  opacity: s.unlocked ? 1 : 0.5,
                  background: s.unlocked ? '#fff' : '#F0F2F8',
                }}
              >
                <motion.div
                  style={styles.stampEmoji}
                  animate={s.unlocked ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {s.unlocked ? s.emoji : <i className="fa-solid fa-lock" style={{ fontSize: 16, color: '#C0C0D0' }} />}
                </motion.div>
                <div style={styles.stampName}>{s.name}</div>
                {s.unlocked && (
                  <motion.div
                    style={styles.stampCheck}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <i className="fa-solid fa-check" style={{ fontSize: 8, color: '#fff' }} />
                  </motion.div>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Leaderboard Badge */}
      <div style={styles.section}>
        <BlurFade delay={0.3}>
          <NeonGradientCard
            borderRadius={16}
            neonColors={['#FBBF24', '#F59E0B']}
            style={{ padding: '14px 16px' }}
          >
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              whileHover={{ x: 4 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <i className="fa-solid fa-trophy" style={{ fontSize: 18, color: '#FBBF24' }} />
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>GyeongbukExplorer</div>
                <div style={{ fontSize: 11, color: '#A0A0B8' }}>
                  {leaderboard.rank_title} · 점수 <NumberTicker value={leaderboard.score} style={{ fontSize: 11, color: '#A0A0B8' }} />
                </div>
              </div>
              <motion.i
                className="fa-solid fa-chevron-right"
                style={{ fontSize: 14, color: '#D0D0E0' }}
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </NeonGradientCard>
        </BlurFade>
      </div>

      <div style={{ height: 16 }} />
    </div>
  )
}

const styles = {
  header: {
    background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 30%, #4A6CF7 60%, #7DD3FC 100%)',
    padding: '40px 20px 28px', borderRadius: '0 0 24px 24px',
    display: 'flex', flexDirection: 'column', gap: 6,
    position: 'relative', overflow: 'hidden',
  },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  headerStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  section: { padding: '20px 20px 0' },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 12,
    display: 'flex', alignItems: 'center',
  },
  cityDot: { width: 10, height: 10, borderRadius: '50%' },
  stampGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  stampItem: {
    borderRadius: 14, padding: '14px 8px', textAlign: 'center',
    position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  stampEmoji: {
    fontSize: 28, marginBottom: 6, display: 'flex',
    alignItems: 'center', justifyContent: 'center', height: 36,
  },
  stampName: { fontSize: 11, fontWeight: 600, color: '#1A1A2E' },
  stampCheck: {
    position: 'absolute', top: 6, right: 6, width: 16, height: 16,
    borderRadius: '50%', background: '#10B981',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}
