import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { isNfcSupported, startNfcReader, processNfcTag } from '../lib/nfc'
import { getAll } from '../lib/firebase'
import logger from '../lib/logger'
import {
  BlurFade, AnimatedGradientText, PulsatingButton, ShimmerButton,
  Particles, MagicCard, StaggerContainer, StaggerItem,
  NeonGradientCard, NumberTicker, BorderBeam
} from '../components/magicui'

export default function NfcTag() {
  const [searchParams] = useSearchParams()
  const { spotId: paramSpotId } = useParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState('idle')
  const [nfcAvailable, setNfcAvailable] = useState(false)
  const [result, setResult] = useState(null)
  const [spots, setSpots] = useState([])
  const [simOpen, setSimOpen] = useState(false)
  const readerRef = useRef(null)

  async function handleTag(spotId) {
    setMode('processing')
    setResult(null)
    logger.info('NFC_PAGE', `태깅 시작: ${spotId}`)
    const res = await processNfcTag(spotId)
    if (res.success) {
      setMode('success')
      setResult(res)
    } else {
      setMode('error')
      setResult(res)
    }
  }

  async function startScanning() {
    setMode('scanning')
    logger.info('NFC_PAGE', 'NFC 스캔 시작')
    const reader = await startNfcReader((spotId) => handleTag(spotId))
    readerRef.current = reader
    if (!reader) {
      setMode('idle')
      setSimOpen(true)
    }
  }

  function reset() {
    setMode('idle')
    setResult(null)
    setSimOpen(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNfcAvailable(isNfcSupported())
    getAll('tg_spots').then(setSpots).catch(() => {})
    const spotId = paramSpotId || searchParams.get('spot')
    if (spotId) handleTag(spotId)
  }, [paramSpotId, searchParams])

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={styles.header}>
        <Particles count={20} color="rgba(255,255,255,0.35)" />
        <BlurFade delay={0.1}>
          <i className="fa-solid fa-nfc-signal" style={{ fontSize: 20, color: '#fff' }} />
        </BlurFade>
        <BlurFade delay={0.2}>
          <AnimatedGradientText
            colors={['#fff', '#7DD3FC', '#A78BFA', '#fff']}
            style={{ fontSize: 22, fontWeight: 800, display: 'block' }}
          >
            NFC 태깅
          </AnimatedGradientText>
        </BlurFade>
        <BlurFade delay={0.3}>
          <p style={styles.subtitle}>
            {nfcAvailable ? 'NFC 카드를 휴대폰에 태그하세요' : 'NFC 미지원 기기 — 시뮬레이션 모드'}
          </p>
        </BlurFade>
      </div>

      <div style={{ padding: '20px' }}>
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <NeonGradientCard borderRadius={20} neonColors={['#4A6CF7', '#7DD3FC']} style={{ padding: '32px 24px', textAlign: 'center' }}>
                <motion.div
                  style={styles.nfcIcon}
                  animate={{ boxShadow: ['0 0 0 0 rgba(74,108,247,0.2)', '0 0 0 20px rgba(74,108,247,0)', '0 0 0 0 rgba(74,108,247,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.i
                    className="fa-solid fa-wifi"
                    style={{ fontSize: 48, color: '#4A6CF7', transform: 'rotate(90deg)' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
                  관광지에서 NFC 태깅하기
                </h2>
                <p style={{ fontSize: 13, color: '#A0A0B8', marginBottom: 20, lineHeight: 1.6 }}>
                  관광지에 설치된 NFC 태그에 휴대폰을 가져다 대면{'\n'}
                  자동으로 스탬프가 해제되고 포인트를 받을 수 있어요.
                </p>

                {nfcAvailable ? (
                  <PulsatingButton onClick={startScanning} pulseColor="#4A6CF7" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="fa-solid fa-tower-broadcast" style={{ marginRight: 8 }} />
                    NFC 스캔 시작
                  </PulsatingButton>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={styles.badge}>
                      <i className="fa-solid fa-circle-info" style={{ color: '#F59E0B', marginRight: 6 }} />
                      이 기기는 Web NFC를 지원하지 않습니다
                    </div>
                    <ShimmerButton onClick={() => setSimOpen(true)} style={{ width: '100%', justifyContent: 'center' }}>
                      <i className="fa-solid fa-hand-pointer" style={{ marginRight: 8 }} />
                      시뮬레이션 태깅
                    </ShimmerButton>
                  </div>
                )}
              </NeonGradientCard>
            </motion.div>
          )}

          {/* Scanning State */}
          {mode === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <BorderBeam borderRadius={20} color1="#4A6CF7" color2="#7DD3FC" duration={2}>
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 20px' }}>
                    <motion.div
                      style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #4A6CF7' }}
                      animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #7DD3FC' }}
                      animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    />
                    <div style={{ ...styles.nfcIcon, position: 'relative', zIndex: 1 }}>
                      <motion.i
                        className="fa-solid fa-wifi"
                        style={{ fontSize: 36, color: '#4A6CF7', transform: 'rotate(90deg)' }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    </div>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
                    NFC 태그를 기다리는 중...
                  </h2>
                  <p style={{ fontSize: 13, color: '#A0A0B8', marginBottom: 20 }}>
                    휴대폰 뒷면을 NFC 태그에 가까이 대주세요
                  </p>
                  <button onClick={reset} style={styles.secondaryBtn}>취소</button>
                </div>
              </BorderBeam>
            </motion.div>
          )}

          {/* Processing */}
          {mode === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.card}
            >
              <motion.div
                style={{ fontSize: 48, marginBottom: 16 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <i className="fa-solid fa-spinner" style={{ color: '#4A6CF7' }} />
              </motion.div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>태깅 처리 중...</h2>
            </motion.div>
          )}

          {/* Success */}
          {mode === 'success' && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <NeonGradientCard borderRadius={20} neonColors={['#10B981', '#34D399']} style={{ padding: '32px 24px', textAlign: 'center' }}>
                <motion.div
                  style={{ fontSize: 48, marginBottom: 12 }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  {result.alreadyUnlocked ? '🔄' : '🎉'}
                </motion.div>
                <AnimatedGradientText
                  colors={['#10B981', '#34D399', '#6EE7B7', '#10B981']}
                  style={{ fontSize: 20, fontWeight: 800, display: 'block', marginBottom: 6 }}
                >
                  태깅 성공!
                </AnimatedGradientText>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>
                  {result.spot?.name}
                </p>
                <p style={{ fontSize: 13, color: '#A0A0B8', marginBottom: 4 }}>
                  {result.spot?.city} · {result.spot?.category}
                </p>
                <motion.div
                  style={styles.pointsBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  +<NumberTicker value={result.points} style={{ fontSize: 18, fontWeight: 800, color: '#fff' }} />점
                </motion.div>
                <p style={{ fontSize: 13, color: '#666', margin: '12px 0 20px' }}>
                  {result.message}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={reset} style={styles.secondaryBtn}>다시 태깅</button>
                  <ShimmerButton onClick={() => navigate('/explore')} style={{ flex: 1, justifyContent: 'center' }}>
                    탐험 지도 보기
                  </ShimmerButton>
                </div>
              </NeonGradientCard>
            </motion.div>
          )}

          {/* Error */}
          {mode === 'error' && result && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{ ...styles.card, border: '2px solid #EF4444' }}>
                <motion.div
                  style={{ fontSize: 48, marginBottom: 12 }}
                  animate={{ x: [-5, 5, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  ❌
                </motion.div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>
                  태깅 실패
                </h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
                  {result.error}
                </p>
                <PulsatingButton onClick={reset} pulseColor="#EF4444" style={{ width: '100%', justifyContent: 'center' }}>
                  다시 시도
                </PulsatingButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulation Panel */}
        <AnimatePresence>
          {simOpen && mode === 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 20, overflow: 'hidden' }}
            >
              <BlurFade delay={0.1}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 12 }}>
                  <i className="fa-solid fa-flask" style={{ color: '#8B5CF6', marginRight: 6 }} />
                  시뮬레이션: 관광지 선택
                </h3>
              </BlurFade>
              <StaggerContainer staggerDelay={0.08} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {spots.map(spot => (
                  <StaggerItem key={spot.id}>
                    <MagicCard
                      style={{ padding: '14px 12px', cursor: 'pointer' }}
                      glowColor="rgba(139,92,246,0.15)"
                    >
                      <div onClick={() => handleTag(spot.id)} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 11, color: '#4A6CF7', fontWeight: 600 }}>{spot.city}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>{spot.name}</span>
                        <span style={{ fontSize: 11, color: '#A0A0B8' }}>{spot.category}</span>
                      </div>
                    </MagicCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
  card: {
    background: '#fff', borderRadius: 20, padding: '32px 24px',
    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  nfcIcon: {
    width: 100, height: 100, borderRadius: '50%', background: '#EEF2FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
  },
  secondaryBtn: {
    padding: '14px 28px', borderRadius: 14,
    border: '2px solid #E0E0EE', background: '#fff', color: '#666',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', flex: 1,
  },
  badge: {
    padding: '8px 14px', borderRadius: 10, background: '#FFFBEB',
    fontSize: 12, color: '#92400E', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  pointsBadge: {
    display: 'inline-block', padding: '6px 18px', borderRadius: 20,
    background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    color: '#fff', fontSize: 18, fontWeight: 800, marginTop: 8,
  },
}
