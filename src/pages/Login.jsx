import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEMO_USER_ID, getById } from '../lib/firebase'
import {
  BlurFade, AnimatedGradientText, ShimmerButton, PulsatingButton,
  Particles, MagicCard, StaggerContainer, StaggerItem,
  BorderBeam, TypingAnimation
} from '../components/magicui'

const KAKAO_JS_KEY = '0192783ba4afa37564a9e3ec7595b220'
const KAKAO_REST_KEY = '39b318ede845f101187c8b3f9d33355c'

export default function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleKakaoLogin = () => {
    setIsLoading(true)
    const redirectUri = `${window.location.origin}/auth/kakao/callback`
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`
    window.location.href = kakaoAuthUrl
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      const user = await getById('tg_users', DEMO_USER_ID)
      if (user) {
        localStorage.setItem('tg_user', JSON.stringify(user))
        localStorage.setItem('tg_logged_in', 'true')
        navigate('/explore')
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.bgTop}>
        <Particles count={35} color="rgba(255,255,255,0.3)" />
      </div>

      {/* Logo Area */}
      <div style={styles.logoArea}>
        <BlurFade delay={0.1}>
          <motion.div
            style={styles.logoIcon}
            animate={{
              boxShadow: ['0 4px 20px rgba(0,0,0,0.15)', '0 4px 32px rgba(74,108,247,0.4)', '0 4px 20px rgba(0,0,0,0.15)'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <motion.i
              className="fa-solid fa-location-dot"
              style={{ fontSize: 32, color: '#fff' }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </BlurFade>
        <BlurFade delay={0.2}>
          <AnimatedGradientText
            colors={['#fff', '#7DD3FC', '#A78BFA', '#fff']}
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', display: 'block' }}
          >
            TapGyeong
          </AnimatedGradientText>
        </BlurFade>
        <BlurFade delay={0.3}>
          <p style={styles.appNameKo}>탭경</p>
        </BlurFade>
        <BlurFade delay={0.4}>
          <div style={styles.tagline}>
            <TypingAnimation
              texts={[
                'NFC 스마트카드 하나로 경북 전역을 여행하다',
                'AI 맞춤 코스 추천으로 스마트한 여행',
                '스탬프 투어로 경북을 탐험하세요',
              ]}
              speed={60}
              pause={2500}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}
            />
          </div>
        </BlurFade>
      </div>

      {/* Login Card */}
      <BlurFade delay={0.5}>
        <BorderBeam borderRadius={20} color1="#4A6CF7" color2="#7DD3FC" duration={5}>
          <div style={styles.loginCard}>
            <h2 style={styles.loginTitle}>로그인</h2>
            <p style={styles.loginDesc}>소셜 계정으로 간편하게 시작하세요</p>

            {error && (
              <motion.div
                style={styles.errorBox}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 12, marginRight: 6 }} />
                {error}
              </motion.div>
            )}

            {/* Kakao Login Button */}
            <motion.button
              style={styles.kakaoBtn}
              onClick={handleKakaoLogin}
              disabled={isLoading}
              whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(254,229,0,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
                <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.64 1.74 4.96 4.36 6.3-.14.52-.9 3.36-.93 3.58 0 0-.02.16.08.22.1.06.22.02.22.02.29-.04 3.38-2.22 3.92-2.6.76.1 1.56.16 2.36.16 5.52 0 10-3.48 10-7.68C22 6.48 17.52 3 12 3z" fill="#3C1E1E"/>
              </svg>
              카카오 로그인
            </motion.button>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>또는</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Demo Login */}
            <ShimmerButton
              onClick={handleDemoLogin}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            >
              <i className="fa-solid fa-user-astronaut" style={{ fontSize: 16, marginRight: 8 }} />
              {isLoading ? '로그인 중...' : '데모 체험하기'}
            </ShimmerButton>

            <p style={styles.demoHint}>
              <i className="fa-solid fa-info-circle" style={{ fontSize: 11, marginRight: 4 }} />
              데모 계정으로 모든 기능을 체험할 수 있어요
            </p>
          </div>
        </BorderBeam>
      </BlurFade>

      {/* Features Preview */}
      <BlurFade delay={0.6}>
        <StaggerContainer staggerDelay={0.1} style={styles.featuresRow}>
          {[
            { icon: 'fa-hand-pointer', label: 'NFC 태깅', color: '#4A6CF7' },
            { icon: 'fa-wand-magic-sparkles', label: 'AI 추천', color: '#8B5CF6' },
            { icon: 'fa-map', label: '맵 컬러링', color: '#10B981' },
            { icon: 'fa-ticket', label: '쿠폰', color: '#F59E0B' },
          ].map((f, i) => (
            <StaggerItem key={i} style={{ flex: 1 }}>
              <MagicCard style={{ padding: '14px 8px', textAlign: 'center' }} glowColor={`${f.color}15`}>
                <motion.i
                  className={`fa-solid ${f.icon}`}
                  style={{ fontSize: 14, color: f.color }}
                  whileHover={{ scale: 1.3, rotate: 10 }}
                />
                <div style={{ fontSize: 10, color: '#8888A8', marginTop: 4 }}>{f.label}</div>
              </MagicCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </BlurFade>

      {/* Footer */}
      <BlurFade delay={0.7}>
        <div style={styles.footer}>
          <p style={{ fontSize: 11, color: '#A0A0B8' }}>
            2026 관광데이터 활용 공모전 · 팀 탐경
          </p>
        </div>
      </BlurFade>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', background: '#F5F7FB',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
  },
  bgTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 320,
    background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 30%, #4A6CF7 60%, #7DD3FC 100%)',
    borderRadius: '0 0 40px 40px', overflow: 'hidden',
  },
  logoArea: {
    position: 'relative', zIndex: 1, textAlign: 'center',
    paddingTop: 60, marginBottom: 32,
  },
  logoIcon: {
    width: 72, height: 72, borderRadius: 20,
    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  appNameKo: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: 500 },
  tagline: { marginTop: 12, minHeight: 20 },
  loginCard: {
    background: '#fff', borderRadius: 20, padding: '28px 24px',
    width: 'calc(100vw - 48px)', maxWidth: 400,
  },
  loginTitle: { fontSize: 20, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 },
  loginDesc: { fontSize: 13, color: '#8888A8', marginBottom: 20 },
  errorBox: {
    background: '#FEF2F2', color: '#DC2626', fontSize: 12,
    padding: '10px 14px', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center',
  },
  kakaoBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FEE500', color: '#3C1E1E', fontSize: 15, fontWeight: 600,
    padding: '14px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
    transition: 'opacity 0.2s', marginBottom: 16,
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, background: '#EEEEF2' },
  dividerText: { fontSize: 12, color: '#A0A0B8', fontWeight: 500 },
  demoHint: {
    fontSize: 11, color: '#A0A0B8', textAlign: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  featuresRow: { display: 'flex', gap: 10, padding: '0 24px', marginBottom: 32, width: '100%', maxWidth: 440 },
  footer: { textAlign: 'center', padding: '0 24px 32px' },
}
