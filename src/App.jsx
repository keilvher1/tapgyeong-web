import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Landing from './pages/Landing'
import Login from './pages/Login'
import KakaoCallback from './pages/KakaoCallback'
import MyPage from './pages/MyPage'
import Recommend from './pages/Recommend'
import ExploreMap from './pages/ExploreMap'
import Coupon from './pages/Coupon'

function App() {
  const location = useLocation()
  const hideNav = ['/', '/login', '/auth/kakao/callback'].includes(location.pathname)

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
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
    </>
  )
}

export default App
