import { useState, useEffect } from 'react'
import KakaoMap from '../components/KakaoMap'
import { db, DEMO_USER_ID, getAll, getFiltered, getById, where } from '../lib/firebase'

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
        // Fetch all spots from Firestore
        const spots = await getAll('tg_spots')

        // Fetch user stamps (denormalized - spot info included)
        const userStamps = await getFiltered('tg_stamps', where('user_id', '==', DEMO_USER_ID))

        // Fetch leaderboard data
        const leaderData = await getById('tg_leaderboard', DEMO_USER_ID)

        // Process stamps with unlocked status and emojis
        const unlockedSpotIds = new Set((userStamps || []).map(s => s.spot_id))
        const processedStamps = (spots || []).map(spot => ({
          name: spot.name,
          unlocked: unlockedSpotIds.has(spot.id),
          emoji: emojiMap[spot.category] || '📍',
        }))

        setStamps(processedStamps)

        // Calculate city progress
        const cityMap = {}
        const cityDefaults = {
          '경주': { color: '#FBBF24', center: { lat: 35.83, lng: 129.22 }, key: 'gyeongju' },
          '안동': { color: '#34D399', center: { lat: 36.57, lng: 128.73 }, key: 'andong' },
          '포항': { color: '#F472B6', center: { lat: 36.04, lng: 129.37 }, key: 'pohang' },
        }

        spots?.forEach(spot => {
          if (!cityMap[spot.city]) {
            cityMap[spot.city] = { total: 0, visited: 0 }
          }
          cityMap[spot.city].total += 1
        })

        userStamps?.forEach(stamp => {
          const city = stamp.spot_city
          if (city && cityMap[city]) {
            cityMap[city].visited += 1
          }
        })

        const updatedCities = Object.entries(cityMap).map(([cityName, data]) => ({
          name: cityName,
          ...cityDefaults[cityName],
          total: data.total,
          visited: data.visited,
          progress: data.total > 0 ? Math.round((data.visited / data.total) * 100) : 0,
        }))

        setCities(updatedCities)

        // Set leaderboard data
        if (leaderData) {
          setLeaderboard(leaderData)
        }
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

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={styles.header}>
        <i className="fa-solid fa-map-location-dot" style={{ fontSize: 20, color: '#fff' }} />
        <h1 style={styles.title}>경북 탐험 현황</h1>
        <p style={styles.subtitle}>방문한 관광지가 지도에 표시됩니다</p>
      </div>

      {/* City Progress */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <i className="fa-solid fa-chart-simple" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
          도시별 탐험 진행률
        </h2>
        {cities.map((c, i) => (
          <div
            key={i}
            style={{
              ...styles.cityCard,
              border: selectedCity === c.key ? `2px solid ${c.color}` : '2px solid transparent',
            }}
            onClick={() => setSelectedCity(selectedCity === c.key ? 'all' : c.key)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ ...styles.cityDot, background: c.color }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{c.name}</span>
                <span style={{ fontSize: 11, color: '#A0A0B8' }}>{c.visited}/{c.total}곳</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: c.color }}>{c.progress}%</span>
            </div>
            <div style={styles.barBg}>
              <div style={{ ...styles.barFill, width: `${c.progress}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Real Kakao Map */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <i className="fa-solid fa-earth-asia" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
          경북 지역 탐험 지도
        </h2>
        <KakaoMap
          key={selectedCity}
          height={320}
          center={mapProps.center}
          zoom={mapProps.zoom}
          markers={mapProps.markers}
        />
      </div>

      {/* Digital Stamp Book */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={styles.sectionTitle}>
            <i className="fa-solid fa-stamp" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
            디지털 스탬프 북
          </h2>
          <span style={{ fontSize: 12, color: '#4A6CF7', fontWeight: 600 }}>
            {stamps.filter(s => s.unlocked).length}/{stamps.length}
          </span>
        </div>
        <div style={styles.stampGrid}>
          {stamps.map((s, i) => (
            <div key={i} style={{
              ...styles.stampItem,
              opacity: s.unlocked ? 1 : 0.5,
              background: s.unlocked ? '#fff' : '#F0F2F8',
            }}>
              <div style={styles.stampEmoji}>
                {s.unlocked ? s.emoji : <i className="fa-solid fa-lock" style={{ fontSize: 16, color: '#C0C0D0' }} />}
              </div>
              <div style={styles.stampName}>{s.name}</div>
              {s.unlocked && (
                <div style={styles.stampCheck}>
                  <i className="fa-solid fa-check" style={{ fontSize: 8, color: '#fff' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Badge */}
      <div style={styles.section}>
        <div style={styles.leaderCard}>
          <i className="fa-solid fa-trophy" style={{ fontSize: 18, color: '#FBBF24' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>GyeongbukExplorer</div>
            <div style={{ fontSize: 11, color: '#A0A0B8' }}>
              {leaderboard.rank_title} · 점수 {leaderboard.score}
            </div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 14, color: '#D0D0E0' }} />
        </div>
      </div>

      <div style={{ height: 16 }} />
    </div>
  )
}

const styles = {
  header: {
    background: 'linear-gradient(160deg, #1E3A8A 0%, #4A6CF7 40%, #7DD3FC 100%)',
    padding: '40px 20px 28px', borderRadius: '0 0 24px 24px',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  title: { fontSize: 22, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  section: { padding: '20px 20px 0' },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 12,
    display: 'flex', alignItems: 'center',
  },
  cityCard: {
    background: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'border 0.2s',
  },
  cityDot: { width: 10, height: 10, borderRadius: '50%' },
  barBg: { height: 6, borderRadius: 3, background: '#F0F2F8', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
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
  leaderCard: {
    background: '#fff', borderRadius: 14, padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
}
