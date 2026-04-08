import { useState, useEffect } from 'react'
import KakaoMap from '../components/KakaoMap'
import { getAll } from '../lib/firebase'

export default function Recommend() {
  const [activeFilter, setActiveFilter] = useState('전체')
  const [showMap, setShowMap] = useState(false)
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)

  const filters = ['전체', '문화유산', '자연경관', '체험', '맛집']

  const emojiMap = {
    '문화유산': '🏛️',
    '자연경관': '🌅',
    '체험': '🎭',
    '맛집': '🍜',
  }

  // Hardcoded spots for fallback while loading
  const defaultSpots = [
    { name: '석굴암', dist: '3.5km', match: 91, cat: '문화유산', desc: '신라 불교예술의 최고 걸작', tag: '고궁 보물', emoji: '🏛️' },
    { name: '첨성대', dist: '1.2km', match: 87, cat: '문화유산', desc: '동양 최고의 천문관측대', tag: '95% 매칭', emoji: '🔭' },
    { name: '대릉원', dist: '0.8km', match: 83, cat: '문화유산', desc: '천년 왕국의 왕릉 군집', tag: '인기 스팟', emoji: '👑' },
  ]

  // Fetch spots from Firestore
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true)
        const data = await getAll('tg_spots')

        if (data && data.length > 0) {
          // Transform Firestore data to component format
          const transformedSpots = data.map((spot) => ({
            id: spot.id,
            name: spot.name,
            lat: spot.lat,
            lng: spot.lng,
            category: spot.category,
            desc: spot.description,
            dist: `${Math.abs(spot.lat - 35.79).toFixed(1)}km`,
            match: Math.max(70, 95 - (spot.id || 0) * 2),
            cat: spot.category,
            tag: `${Math.max(70, 95 - (spot.id || 0) * 2)}% 매칭`,
            emoji: emojiMap[spot.category] || '📍',
          }))
          setSpots(transformedSpots)
        } else {
          setSpots(defaultSpots)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setSpots(defaultSpots)
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [])

  // Filter spots based on active filter
  const filteredSpots = activeFilter === '전체'
    ? spots
    : spots.filter(s => s.cat === activeFilter)

  const restaurants = [
    { name: '한우 숯불갈비', area: '경주시 보문동', rating: 4.8, type: '한식', price: '₩₩₩' },
    { name: '잠봉 정식', area: '경주시 황남동', rating: 4.5, type: '한식', price: '₩₩' },
    { name: '황남빵 본점', area: '경주시 황남동', rating: 4.7, type: '베이커리', price: '₩' },
  ]

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 20, color: '#fff' }} />
          <h1 style={styles.title}>다음은 어디로 갈까요?</h1>
          <p style={styles.subtitle}>방문 패턴을 분석해 맞춤 관광지를 추천해드려요</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={styles.filterRow}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              ...styles.filterChip,
              background: activeFilter === f ? '#4A6CF7' : '#fff',
              color: activeFilter === f ? '#fff' : '#4A4A6A',
              boxShadow: activeFilter === f ? '0 2px 8px rgba(74,108,247,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Map Toggle Section */}
      {showMap && (
        <div style={{ padding: '0 20px 16px' }}>
          <KakaoMap
            height={220}
            center={{ lat: 35.83, lng: 129.22 }}
            zoom={8}
            markers="gyeongju"
          />
        </div>
      )}

      {/* Spot Cards */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <i className="fa-solid fa-location-dot" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
          유사 관광지 추천
        </h2>
        {filteredSpots.map((s, i) => (
          <div key={i} style={styles.spotCard}>
            <div>
              <div style={styles.spotEmoji}>{s.emoji}</div>
            </div>
            <div style={styles.spotCenter}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={styles.spotName}>{s.name}</h3>
                <span style={styles.spotTag}>{s.tag}</span>
              </div>
              <p style={styles.spotDesc}>{s.desc}</p>
              <div style={styles.spotMeta}>
                <i className="fa-solid fa-diamond-turn-right" style={{ fontSize: 9, color: '#A0A0B8' }} />
                <span>{s.dist}</span>
                <span style={{ color: '#D0D0E0' }}>·</span>
                <span>{s.cat}</span>
              </div>
            </div>
            <div>
              <div style={styles.matchCircle}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#EBF0FF" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#4A6CF7" strokeWidth="4"
                    strokeDasharray={`${s.match * 1.256} 999`}
                    strokeLinecap="round"
                    transform="rotate(-90 24 24)" />
                </svg>
                <span style={styles.matchText}>{s.match}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Restaurant Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <i className="fa-solid fa-utensils" style={{ fontSize: 14, color: '#F59E0B', marginRight: 6 }} />
          로컬 맛집 추천
        </h2>
        {restaurants.map((r, i) => (
          <div key={i} style={styles.restCard}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{r.name}</h3>
                <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                  <i className="fa-solid fa-star" style={{ fontSize: 10 }} /> {r.rating}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#A0A0B8', marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: 9 }} /> {r.area}
                <span style={{ color: '#D0D0E0' }}>·</span>
                {r.type}
                <span style={{ color: '#D0D0E0' }}>·</span>
                {r.price}
              </div>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 14, color: '#D0D0E0' }} />
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div style={styles.section}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={styles.ctaSecondary} onClick={() => setShowMap(!showMap)}>
            <i className="fa-solid fa-map" style={{ fontSize: 14 }} />
            {showMap ? '지도 닫기' : '지도에서 보기'}
          </button>
          <button style={styles.ctaPrimary}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 14 }} />
            태깅 기반 추천
          </button>
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
  },
  headerContent: { display: 'flex', flexDirection: 'column', gap: 8 },
  title: { fontSize: 22, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  filterRow: { display: 'flex', gap: 8, padding: '16px 20px', overflowX: 'auto' },
  filterChip: { whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 20, transition: 'all 0.2s' },
  section: { padding: '0 20px 20px' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 12, display: 'flex', alignItems: 'center' },
  spotCard: {
    background: '#fff', borderRadius: 14, padding: 14, display: 'flex',
    alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  spotEmoji: {
    width: 48, height: 48, borderRadius: 14, background: '#F8F9FE',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
  },
  spotCenter: { flex: 1, minWidth: 0 },
  spotName: { fontSize: 15, fontWeight: 700, color: '#1A1A2E' },
  spotTag: { fontSize: 10, fontWeight: 600, color: '#4A6CF7', background: '#EBF0FF', padding: '2px 8px', borderRadius: 8 },
  spotDesc: { fontSize: 12, color: '#8888A8', marginTop: 3 },
  spotMeta: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#A0A0B8', marginTop: 4 },
  matchCircle: { position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  matchText: { position: 'absolute', fontSize: 11, fontWeight: 700, color: '#4A6CF7' },
  restCard: {
    background: '#fff', borderRadius: 12, padding: '14px 16px',
    display: 'flex', alignItems: 'center', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  ctaPrimary: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)', color: '#fff',
    fontSize: 14, fontWeight: 600, padding: '14px', borderRadius: 12,
  },
  ctaSecondary: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: '#fff', color: '#4A6CF7', fontSize: 14, fontWeight: 600,
    padding: '14px', borderRadius: 12, border: '1.5px solid #4A6CF7',
  },
}
