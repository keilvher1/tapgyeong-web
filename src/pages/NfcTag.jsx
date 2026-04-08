import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { isNfcSupported, startNfcReader, processNfcTag } from '../lib/nfc'
import { getAll } from '../lib/firebase'
import logger from '../lib/logger'

export default function NfcTag() {
  const [searchParams] = useSearchParams()
  const { spotId: paramSpotId } = useParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState('idle') // idle | scanning | processing | success | error
  const [nfcAvailable, setNfcAvailable] = useState(false)
  const [result, setResult] = useState(null)
  const [spots, setSpots] = useState([])
  const [simOpen, setSimOpen] = useState(false)
  const readerRef = useRef(null)

  useEffect(() => {
    setNfcAvailable(isNfcSupported())
    getAll('tg_spots').then(setSpots).catch(() => {})

    // URL 파라미터로 태깅 (QR코드 / NFC URL 등)
    const spotId = paramSpotId || searchParams.get('spot')
    if (spotId) {
      handleTag(spotId)
    }
  }, [])

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
    const reader = await startNfcReader((spotId) => {
      handleTag(spotId)
    })
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

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={styles.header}>
        <i className="fa-solid fa-nfc-signal" style={{ fontSize: 20, color: '#fff' }} />
        <h1 style={styles.title}>NFC 태깅</h1>
        <p style={styles.subtitle}>
          {nfcAvailable ? 'NFC 카드를 휴대폰에 태그하세요' : 'NFC 미지원 기기 — 시뮬레이션 모드'}
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Idle State */}
        {mode === 'idle' && (
          <div style={styles.card}>
            <div style={styles.nfcIcon}>
              <i className="fa-solid fa-wifi" style={{ fontSize: 48, color: '#4A6CF7', transform: 'rotate(90deg)' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
              관광지에서 NFC 태깅하기
            </h2>
            <p style={{ fontSize: 13, color: '#A0A0B8', marginBottom: 20, lineHeight: 1.6 }}>
              관광지에 설치된 NFC 태그에 휴대폰을 가져다 대면{'\n'}
              자동으로 스탬프가 해제되고 포인트를 받을 수 있어요.
            </p>

            {nfcAvailable ? (
              <button onClick={startScanning} style={styles.primaryBtn}>
                <i className="fa-solid fa-tower-broadcast" style={{ marginRight: 8 }} />
                NFC 스캔 시작
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={styles.badge}>
                  <i className="fa-solid fa-circle-info" style={{ color: '#F59E0B', marginRight: 6 }} />
                  이 기기는 Web NFC를 지원하지 않습니다
                </div>
                <button onClick={() => setSimOpen(true)} style={styles.primaryBtn}>
                  <i className="fa-solid fa-hand-pointer" style={{ marginRight: 8 }} />
                  시뮬레이션 태깅
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scanning State */}
        {mode === 'scanning' && (
          <div style={styles.card}>
            <div style={styles.scanPulse}>
              <div style={styles.pulseRing} />
              <i className="fa-solid fa-wifi" style={{ fontSize: 36, color: '#4A6CF7', transform: 'rotate(90deg)', position: 'relative', zIndex: 1 }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
              NFC 태그를 기다리는 중...
            </h2>
            <p style={{ fontSize: 13, color: '#A0A0B8', marginBottom: 20 }}>
              휴대폰 뒷면을 NFC 태그에 가까이 대주세요
            </p>
            <button onClick={reset} style={styles.secondaryBtn}>취소</button>
          </div>
        )}

        {/* Processing */}
        {mode === 'processing' && (
          <div style={styles.card}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ color: '#4A6CF7' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>태깅 처리 중...</h2>
          </div>
        )}

        {/* Success */}
        {mode === 'success' && result && (
          <div style={{ ...styles.card, border: '2px solid #10B981' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {result.alreadyUnlocked ? '🔄' : '🎉'}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#10B981', marginBottom: 6 }}>
              태깅 성공!
            </h2>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>
              {result.spot?.name}
            </p>
            <p style={{ fontSize: 13, color: '#A0A0B8', marginBottom: 4 }}>
              {result.spot?.city} · {result.spot?.category}
            </p>
            <div style={styles.pointsBadge}>
              +{result.points}점
            </div>
            <p style={{ fontSize: 13, color: '#666', margin: '12px 0 20px' }}>
              {result.message}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={reset} style={styles.secondaryBtn}>다시 태깅</button>
              <button onClick={() => navigate('/explore')} style={styles.primaryBtn}>탐험 지도 보기</button>
            </div>
          </div>
        )}

        {/* Error */}
        {mode === 'error' && result && (
          <div style={{ ...styles.card, border: '2px solid #EF4444' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>
              태깅 실패
            </h2>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
              {result.error}
            </p>
            <button onClick={reset} style={styles.primaryBtn}>다시 시도</button>
          </div>
        )}

        {/* Simulation Panel */}
        {simOpen && mode === 'idle' && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 12 }}>
              <i className="fa-solid fa-flask" style={{ color: '#8B5CF6', marginRight: 6 }} />
              시뮬레이션: 관광지 선택
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {spots.map(spot => (
                <button
                  key={spot.id}
                  onClick={() => handleTag(spot.id)}
                  style={styles.simSpotBtn}
                >
                  <span style={{ fontSize: 11, color: '#4A6CF7', fontWeight: 600 }}>{spot.city}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>{spot.name}</span>
                  <span style={{ fontSize: 11, color: '#A0A0B8' }}>{spot.category}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS animation for pulse */}
      <style>{`
        @keyframes nfcPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
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
  card: {
    background: '#fff', borderRadius: 20, padding: '32px 24px',
    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  nfcIcon: {
    width: 100, height: 100, borderRadius: '50%', background: '#EEF2FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
  },
  scanPulse: {
    width: 100, height: 100, borderRadius: '50%', background: '#EEF2FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px', position: 'relative',
  },
  pulseRing: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '3px solid #4A6CF7',
    animation: 'nfcPulse 1.5s ease-out infinite',
  },
  primaryBtn: {
    padding: '14px 28px', borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)', color: '#fff',
    fontSize: 15, fontWeight: 700, cursor: 'pointer', flex: 1,
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
  simSpotBtn: {
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '14px 12px', borderRadius: 14, border: '2px solid #EEF2FF',
    background: '#fff', cursor: 'pointer', textAlign: 'left',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
}
