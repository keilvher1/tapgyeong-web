import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import KakaoMap from '../components/KakaoMap'
import { DEMO_USER_ID, getFiltered, getById, orderBy, limit } from '../lib/firebase'
import {
  AnimatedGradientText, NumberTicker, ShimmerButton, PulsatingButton,
  BlurFade, MagicCard, Marquee, Particles, BorderBeam,
  NeonGradientCard, SparklesText, StaggerContainer, StaggerItem,
  AnimatedProgress, TypingAnimation,
} from '../components/magicui'

export default function Landing() {
  const navigate = useNavigate()
  const [popularSpots, setPopularSpots] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [recentTags, setRecentTags] = useState([])
  const [mapProgress, setMapProgress] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spotsData, tagsData, userData] = await Promise.all([
          getFiltered('tg_spots', limit(8)),
          getFiltered('tg_tag_history', orderBy('tagged_at', 'desc'), limit(5)),
          getById('tg_users', DEMO_USER_ID),
        ])
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

  const tags = popularSpots.length > 0
    ? popularSpots.map(s => `#${s.name}`)
    : ['#석굴암', '#불국사', '#첨성대', '#대릉원', '#동궁과 월지', '#경주 고촌마을', '#황리단길', '#보문관광단지']

  return (
    <div style={{ background: '#fff', overflow: 'hidden' }}>

      {/* ═══ Hero Section ═══ */}
      <section style={S.hero}>
        <Particles count={40} color="rgba(255,255,255,0.5)" />
        <div style={S.heroInner}>

          {/* Badge */}
          <BlurFade delay={0.1}>
            <motion.div
              style={S.badge}
              animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.2)', '0 0 0 8px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <i className="fa-solid fa-signal" style={{ fontSize: 11 }} />
              <i className="fa-solid fa-wifi" style={{ fontSize: 11 }} />
              <span>NFC 스마트 관광카드</span>
            </motion.div>
          </BlurFade>

          {/* Animated Title */}
          <BlurFade delay={0.2}>
            <h1 style={S.heroTitle}>
              <AnimatedGradientText
                colors={['#fff', '#C7D2FE', '#BAE6FD', '#fff']}
                style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.3, letterSpacing: '-0.5px' }}
              >
                탭 한 번으로,
              </AnimatedGradientText>
              <br />
              <span style={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1.3 }}>경북 전역을 여행하다</span>
            </h1>
          </BlurFade>

          {/* Typing subtitle */}
          <BlurFade delay={0.35}>
            <p style={S.heroSub}>
              NFC 스마트카드 하나로 경주 · 안동 · 포항의<br />
              관광지를 탐험하고{' '}
              <TypingAnimation
                texts={['AI 맞춤 추천', '스탬프 수집', '쿠폰 할인']}
                speed={70}
                pause={2500}
                style={{ fontWeight: 600, color: '#fff' }}
              />
              을 받아보세요
            </p>
          </BlurFade>

          {/* Map */}
          <BlurFade delay={0.5}>
            <div style={S.mapContainer}>
              <BorderBeam borderRadius={16} color1="rgba(255,255,255,0.6)" color2="rgba(125,211,252,0.6)" duration={5}>
                <KakaoMap
                  height={190}
                  center={{ lat: 36.1, lng: 129.0 }}
                  zoom={10}
                  markers="all"
                  style={{ borderRadius: 14 }}
                />
              </BorderBeam>
            </div>
          </BlurFade>

          {/* CTA Button */}
          <BlurFade delay={0.6}>
            <ShimmerButton
              onClick={() => navigate('/login')}
              bgColor="#fff"
              shimmerColor="rgba(74,108,247,0.2)"
              style={{ color: '#4A6CF7', fontSize: 16, fontWeight: 800, padding: '16px 36px', borderRadius: 50, marginBottom: 18 }}
            >
              시작하기
              <i className="fa-solid fa-chevron-right" style={{ fontSize: 14 }} />
            </ShimmerButton>
          </BlurFade>

          {/* City Chips */}
          <BlurFade delay={0.7}>
            <div style={S.cityChips}>
              {[
                { name: '경주', color: '#FBBF24' },
                { name: '안동', color: '#34D399' },
                { name: '포항', color: '#F472B6' },
              ].map(c => (
                <motion.button
                  key={c.name}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/explore')}
                  style={{ ...S.cityChip, borderColor: c.color + '60' }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                  {c.name}
                </motion.button>
              ))}
            </div>
          </BlurFade>

        </div>
      </section>

      {/* ═══ Feature Cards ═══ */}
      <section style={S.section}>
        <BlurFade>
          <h2 style={S.sectionTitle}>
            <SparklesText style={{ fontSize: 17, fontWeight: 800, color: '#1A1A2E' }}>핵심 기능</SparklesText>
          </h2>
        </BlurFade>
        <StaggerContainer style={S.featureGrid} staggerDelay={0.12}>
          {[
            { icon: 'fa-hand-pointer', title: '스마트 터치', desc: 'NFC 태깅으로 관광지 정보를 즉시 확인', color: '#4A6CF7' },
            { icon: 'fa-wand-magic-sparkles', title: 'AI 추천', desc: '방문 패턴 기반 맞춤 관광지 추천', color: '#8B5CF6' },
            { icon: 'fa-map', title: '맵 컬러링', desc: '방문할수록 채워지는 나만의 경북 지도', color: '#10B981' },
          ].map((f, i) => (
            <StaggerItem key={i}>
              <MagicCard
                glowColor={f.color + '18'}
                style={{ padding: '22px 14px', textAlign: 'center' }}
              >
                <motion.div
                  style={{ ...S.featureIcon, background: f.color + '12', color: f.color }}
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <i className={`fa-solid ${f.icon}`} style={{ fontSize: 22 }} />
                </motion.div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: 10, color: '#8888A8', lineHeight: 1.5 }}>{f.desc}</p>
              </MagicCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══ Hot Destination ═══ */}
      <section style={S.section}>
        <BlurFade>
          <h2 style={S.sectionTitle}>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: 'inline-block', marginRight: 6 }}
            >
              🔥
            </motion.span>
            지금 인기 관광지
          </h2>
        </BlurFade>
        <BlurFade delay={0.15}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            style={S.hotCard}
          >
            <div style={S.hotImage}>
              <Particles count={15} color="rgba(255,255,255,0.4)" />
              <div style={S.hotOverlay}>
                <motion.span
                  style={S.hotBadge}
                  animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.4)', '0 0 0 8px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <i className="fa-solid fa-fire" style={{ marginRight: 4 }} /> HOT
                </motion.span>
                <h3 style={S.hotTitle}>밤이 더 아름다운<br />경주 동궁과 월지</h3>
                <p style={S.hotSub}>야간 조명이 빛나는 천년 신라의 궁궐</p>
              </div>
            </div>
          </motion.div>
        </BlurFade>
      </section>

      {/* ═══ Real-time Tags (Marquee) ═══ */}
      <section style={S.section}>
        <BlurFade>
          <h2 style={S.sectionTitle}>
            <i className="fa-solid fa-arrow-trend-up" style={{ fontSize: 14, color: '#4A6CF7', marginRight: 6 }} />
            실시간 인기 태그
          </h2>
        </BlurFade>
        <BlurFade delay={0.1}>
          <Marquee speed={25} style={{ marginBottom: 10 }}>
            {tags.slice(0, 4).map((tag, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.08, y: -2 }}
                style={{
                  ...S.tag,
                  background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)',
                  color: '#fff', fontWeight: 600,
                  boxShadow: '0 2px 10px rgba(74,108,247,0.2)',
                }}
              >
                <i className="fa-solid fa-hashtag" style={{ fontSize: 9, marginRight: 3, opacity: 0.7 }} />
                {tag.replace('#', '')}
              </motion.span>
            ))}
          </Marquee>
          <Marquee speed={20} direction="right">
            {tags.slice(4).map((tag, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.08, y: -2 }}
                style={{
                  ...S.tag,
                  background: '#F0F2F8',
                  color: '#4A4A6A',
                }}
              >
                {tag}
              </motion.span>
            ))}
          </Marquee>
        </BlurFade>
      </section>

      {/* ═══ Map Progress ═══ */}
      <section style={S.section}>
        <BlurFade>
          <NeonGradientCard neonColors={['#4A6CF7', '#7DD3FC']} style={{ padding: 22, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E' }}>
                <i className="fa-solid fa-palette" style={{ marginRight: 6, color: '#4A6CF7' }} />
                맵 컬러링 진행률
              </span>
              <span style={{ fontSize: 26, fontWeight: 800 }}>
                <AnimatedGradientText colors={['#4A6CF7', '#7DD3FC', '#4A6CF7']}>
                  {mapProgress != null ? (
                    <NumberTicker value={mapProgress} suffix="%" duration={2} />
                  ) : '...%'}
                </AnimatedGradientText>
              </span>
            </div>
            <AnimatedProgress value={mapProgress ?? 0} max={100} color="#4A6CF7" height={10} />
            <p style={{ fontSize: 12, color: '#8888A8', marginTop: 10 }}>
              경북 탐험 완주까지 <strong style={{ color: '#4A6CF7' }}>{mapProgress != null ? 100 - mapProgress : '...'}%</strong> 남았어요!
            </p>
          </NeonGradientCard>
        </BlurFade>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ ...S.section, paddingBottom: 32 }}>
        <BlurFade>
          <PulsatingButton
            onClick={() => navigate('/ai')}
            pulseColor="#4A6CF7"
            style={{
              width: '100%', justifyContent: 'center', gap: 10,
              padding: '17px', borderRadius: 16, fontSize: 16,
              background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)',
              boxShadow: '0 6px 24px rgba(74,108,247,0.3)',
            }}
          >
            <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 16 }} />
            AI 추천 받으러 가기
          </PulsatingButton>
        </BlurFade>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={S.footer}>
        <BlurFade>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            <AnimatedGradientText>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 5 }} />
              TapGyeong 탭경
            </AnimatedGradientText>
          </div>
          <p style={{ fontSize: 11, color: '#A0A0B8', marginTop: 6 }}>
            NFC 스마트 관광카드 · 2026 관광데이터 활용 공모전
          </p>
          <p style={{ fontSize: 10, color: '#C0C0D0', marginTop: 6 }}>
            팀 탐경 | 한국관광공사 OpenAPI 활용
          </p>
        </BlurFade>
      </footer>
    </div>
  )
}

/* ─── Styles ─── */
const S = {
  hero: {
    background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 30%, #4A6CF7 60%, #7DD3FC 100%)',
    padding: '52px 24px 36px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroInner: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative', zIndex: 1,
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 24, padding: '7px 16px',
    fontSize: 12, color: '#fff', fontWeight: 500, marginBottom: 18,
  },
  heroTitle: { marginBottom: 14 },
  heroSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 22,
  },
  mapContainer: { margin: '0 0 24px', width: '100%' },
  cityChips: { display: 'flex', gap: 10 },
  cityChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: 12, fontWeight: 500,
    padding: '8px 16px', borderRadius: 24,
    cursor: 'pointer',
  },
  section: { padding: '26px 20px' },
  sectionTitle: {
    fontSize: 17, fontWeight: 800, color: '#1A1A2E',
    marginBottom: 16, display: 'flex', alignItems: 'center',
  },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  featureIcon: {
    width: 50, height: 50, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
  },
  hotCard: { borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
  hotImage: {
    height: 210, position: 'relative',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 40%, #3B82F6 70%, #0EA5E9 100%)',
  },
  hotOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  hotBadge: {
    display: 'inline-flex', alignItems: 'center',
    background: '#EF4444', color: '#fff',
    fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, marginBottom: 10,
  },
  hotTitle: { fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 6 },
  hotSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  tag: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: 13, padding: '9px 16px', borderRadius: 24,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  footer: { textAlign: 'center', padding: '28px 20px 36px', borderTop: '1px solid #F0F0F5' },
}
