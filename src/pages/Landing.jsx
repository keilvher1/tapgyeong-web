import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import KakaoMap from '../components/KakaoMap'
import { db, DEMO_USER_ID, getAll, getFiltered, getById, where, orderBy, limit } from '../lib/firebase'

export default function Landing() {
  const navigate = useNavigate()
  const [popularSpots, setPopularSpots] = useState([])
  const [recentTags, setRecentTags] = useState([])
  const [mapProgress, setMapProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch popular spots for tag cloud
        const spotsData = await getFiltered('tg_spots', limit(8))

        // Fetch recent tag history (denormalized - spot info included)
        const tagsData = await getFiltered('tg_tag_history', orderBy('tagged_at', 'desc'), limit(5))

        // Fetch user data for map coloring progress
        const userData = await getById('tg_users', DEMO_USER_ID)

        // Update state with fetched data
        if (spotsData) setPopularSpots(spotsData)
        if (tagsData) setRecentTags(tagsData)
        if (userData) setMapProgress(userData.map_coloring_pct || 78)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div style={{ background: '#fff' }}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.badge}>
            <i className="fa-solid fa-signal" style={{ fontSize: 12, color: '#fff' }} />
            <i className="fa-solid fa-wifi" style={{ fontSize: 12, color: '#fff' }} />
            <span>NFC 스마트 관광카드</span>
          </div>
          <h1 style={styles.heroTitle}>
            탭 한 번으로,<br />경북 전역을 여행하다
          </h1>
          <p style={styles.heroSub}>
            NFC 스마트카드 하나로 경주 · 안동 · 포항의<br />
            관광지를 탐험하고 AI 맞춤 추천을 받아보세요
          </p>

          {/* Real Kakao Map */}
          <div style={styles.mapContainer}>
            <KakaoMap
              height={200}
              center={{ lat: 36.1, lng: 129.0 }}
              zoom={10}
              markers="all"
              style={{ borderRadius: 16, border: '2px solid rgba(255,255,255,0.2)' }}
            />
          </div>

          <button style={styles.ctaPrimary} onClick={() => navigate('/login')}>
            시작하기
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 14 }} />
          </button>

          <div style={styles.cityChips}>
            {['경주', '안동', '포항'].map(c => (
              <button key={c} style={styles.cityChip} onClick={() => navigate('/explore')}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: 11 }} /> {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>핵심 기능</h2>
        <div style={styles.featureGrid}>
          {[
            { icon: 'fa-hand-pointer', title: '스마트 터치', desc: 'NFC 태깅으로 관광지 정보를 즉시 확인' },
            { icon: 'fa-wand-magic-sparkles', title: 'AI 추천', desc: '방문 패턴 기반 맞춤 관광지 추천' },
            { icon: 'fa-map', title: '맵 컬러링', desc: '방문할수록 채워지는 나만의 경북 지도' },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <i className={`fa-solid ${f.icon}`} style={{ fontSize: 22, color: '#4A6CF7' }} />
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hot Destination */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <i className="fa-solid fa-fire" style={{ fontSize: 16, color: '#EF4444', marginRight: 6 }} />
          지금 인기 관광지
        </h2>
        <div style={styles.hotCard}>
          <div style={styles.hotImage}>
            <div style={styles.hotOverlay}>
              <span style={styles.hotBadge}>
                <i className="fa-solid fa-fire" style={{ marginRight: 4 }} />HOT
              </span>
              <h3 style={styles.hotTitle}>밤이 더 아름다운<br/>경주 동궁과 월지</h3>
              <p style={styles.hotSub}>야간 조명이 빛나는 천년 신라의 궁궐</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Tags */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <i className="fa-solid fa-arrow-trend-up" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
          실시간 인기 태그
        </h2>
        <div style={styles.tagCloud}>
          {(popularSpots.length > 0
            ? popularSpots.map(s => `#${s.name}`)
            : ['#불국사', '#하회마을', '#호미곶', '#첨성대', '#안동찜닭', '#영일대', '#동궁과월지', '#도산서원']
          ).map((tag, i) => (
            <span key={i} style={{
              ...styles.tag,
              background: i < 3 ? 'linear-gradient(135deg, #4A6CF7, #7DD3FC)' : '#F0F2F8',
              color: i < 3 ? '#fff' : '#4A4A6A',
              fontWeight: i < 3 ? 600 : 400,
            }}>
              {i < 3 && <i className="fa-solid fa-hashtag" style={{ fontSize: 10, marginRight: 2 }} />}
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Map Coloring Progress */}
      <section style={styles.section}>
        <div style={styles.progressCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
              <i className="fa-solid fa-palette" style={{ marginRight: 6 }} />
              맵 컬러링 진행률
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{mapProgress ?? '...'}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${mapProgress ?? 0}%` }} />
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
            경북 탐험 완주까지 {mapProgress != null ? 100 - mapProgress : '...'}% 남았어요!
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...styles.section, paddingBottom: 40 }}>
        <button style={styles.ctaFull} onClick={() => navigate('/recommend')}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 16 }} />
          AI 추천 받으러 가기
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#4A6CF7' }}>
          <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />
          TapGyeong 탭경
        </div>
        <p style={{ fontSize: 11, color: '#A0A0B8', marginTop: 4 }}>
          NFC 스마트 관광카드 · 2026 관광데이터 활용 공모전
        </p>
        <p style={{ fontSize: 10, color: '#C0C0D0', marginTop: 8 }}>
          팀 탐경 | 한국관광공사 OpenAPI 활용
        </p>
      </footer>
    </div>
  )
}

const styles = {
  hero: {
    background: 'linear-gradient(160deg, #1E3A8A 0%, #4A6CF7 40%, #7DD3FC 100%)',
    padding: '48px 24px 32px',
    textAlign: 'center',
  },
  heroInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 12,
    color: '#fff',
    fontWeight: 500,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.35,
    marginBottom: 12,
    letterSpacing: '-0.5px',
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  mapContainer: {
    margin: '8px 0 24px',
    width: '100%',
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#fff',
    color: '#4A6CF7',
    fontSize: 15,
    fontWeight: 700,
    padding: '14px 28px',
    borderRadius: 50,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    marginBottom: 16,
  },
  cityChips: { display: 'flex', gap: 8 },
  cityChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 500,
    padding: '8px 14px',
    borderRadius: 20,
    backdropFilter: 'blur(8px)',
  },
  section: { padding: '24px 20px' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
  },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  featureCard: { background: '#F8F9FE', borderRadius: 14, padding: '20px 12px', textAlign: 'center' },
  featureIcon: {
    width: 48, height: 48, borderRadius: 14, background: '#EBF0FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 10px',
  },
  featureTitle: { fontSize: 13, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 },
  featureDesc: { fontSize: 10, color: '#8888A8', lineHeight: 1.4 },
  hotCard: { borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  hotImage: {
    height: 200,
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #0EA5E9 100%)',
    position: 'relative',
  },
  hotOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  hotBadge: {
    display: 'inline-block', background: '#EF4444', color: '#fff',
    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, marginBottom: 8,
  },
  hotTitle: { fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 4 },
  hotSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: { display: 'inline-flex', alignItems: 'center', fontSize: 13, padding: '8px 14px', borderRadius: 20 },
  progressCard: { background: 'linear-gradient(135deg, #4A6CF7, #60A5FA)', borderRadius: 16, padding: 20 },
  progressBar: { height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, background: '#fff', transition: 'width 0.6s ease' },
  ctaFull: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)', color: '#fff',
    fontSize: 15, fontWeight: 700, padding: '16px', borderRadius: 14,
    boxShadow: '0 4px 16px rgba(74,108,247,0.3)',
  },
  footer: { textAlign: 'center', padding: '24px 20px 32px', borderTop: '1px solid #F0F0F5' },
}
