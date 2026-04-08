import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Landing from './pages/Landing'
import Login from './pages/Login'
import KakaoCallback from './pages/KakaoCallback'
import MyPage from './pages/MyPage'
import Recommend from './pages/Recommend'
import ExploreMap from './pages/ExploreMap'
import Coupon from './pages/Coupon'
import AiRecommend from './pages/AiRecommend'
import NfcTag from './pages/NfcTag'
import Admin from './pages/Admin'

function App() {
  const location = useLocation()
  const hideNav = ['/', '/login', '/auth/kakao/callback', '/admin'].includes(location.pathname)
    || location.pathname.startsWith('/tag')

  return (
    <>
      <div style={{ flex: 1, paddingBottom: hideNav ? 0 : 72, overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/explore" element={<ExploreMap />} />
          <Route path="/coupon" element={<Coupon />} />
          <Route path="/ai" element={<AiRecommend />} />
          <Route path="/tag" element={<NfcTag />} />
          <Route path="/tag/:spotId" element={<NfcTag />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
    </>
  )
}

export default App
