import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, DEMO_USER_ID, getById, getFiltered, updateById, where } from '../lib/firebase'

const KAKAO_REST_KEY = '39b318ede845f101187c8b3f9d33355c'
const KAKAO_CLIENT_SECRET = 'isOdCkWBYgFehdfP9gjIWhrfLVWH3CyX'

export default function KakaoCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('로그인 처리 중...')

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        setStatus('로그인이 취소되었습니다.')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      if (!code) {
        setStatus('인증 코드가 없습니다.')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      try {
        setStatus('카카오 인증 중...')

        // Exchange code for token
        const redirectUri = `${window.location.origin}/auth/kakao/callback`
        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: KAKAO_REST_KEY,
            client_secret: KAKAO_CLIENT_SECRET,
            redirect_uri: redirectUri,
            code,
          }),
        })

        const tokenData = await tokenRes.json()

        if (!tokenData.access_token) {
          throw new Error('토큰 발급 실패')
        }

        setStatus('프로필 정보 가져오는 중...')

        // Get user info
        const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        const profileData = await profileRes.json()
        const kakaoId = profileData.id?.toString()
        const nickname = profileData.kakao_account?.profile?.nickname || '여행자'
        const profileImage = profileData.kakao_account?.profile?.profile_image_url || null

        setStatus('계정 연동 중...')

        // Check if user exists in tg_users by kakao_id
        const existingUsers = await getFiltered('tg_users', where('kakao_id', '==', kakaoId))
        const existingUser = existingUsers.length > 0 ? existingUsers[0] : null

        let user
        if (existingUser) {
          user = existingUser
        } else {
          // Update demo user with Kakao info
          try {
            await updateById('tg_users', DEMO_USER_ID, {
              kakao_id: kakaoId,
              nickname: nickname,
              profile_image: profileImage,
            })
            user = await getById('tg_users', DEMO_USER_ID)
          } catch (updateError) {
            // If update fails, just use demo user
            user = await getById('tg_users', DEMO_USER_ID)
          }
        }

        if (user) {
          localStorage.setItem('tg_user', JSON.stringify(user))
          localStorage.setItem('tg_logged_in', 'true')
          localStorage.setItem('tg_kakao_token', tokenData.access_token)
        }

        setStatus('환영합니다! 🎉')
        setTimeout(() => navigate('/explore'), 1000)
      } catch (err) {
        console.error('Kakao auth error:', err)
        setStatus('로그인 중 오류가 발생했습니다. 데모 모드로 전환합니다...')

        // Fallback to demo login
        const demoUser = await getById('tg_users', DEMO_USER_ID)

        if (demoUser) {
          localStorage.setItem('tg_user', JSON.stringify(demoUser))
          localStorage.setItem('tg_logged_in', 'true')
        }

        setTimeout(() => navigate('/explore'), 2000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner} />
        <p style={styles.text}>{status}</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #1E3A8A 0%, #4A6CF7 40%, #7DD3FC 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '40px 32px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    maxWidth: 320,
    width: '100%',
  },
  spinner: {
    width: 48,
    height: 48,
    border: '4px solid #EBF0FF',
    borderTopColor: '#4A6CF7',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  text: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1A1A2E',
    lineHeight: 1.5,
  },
}

// Add keyframe animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
  document.head.appendChild(styleSheet)
}
