import { useState, useEffect } from 'react'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

export default function Coupon() {
  const [activeTab, setActiveTab] = useState('available')
  const [coupons, setCoupons] = useState([
    { id: 1, title: '황리단길 포항카페', discount: '15% 할인', desc: '음료 전 메뉴 15% 할인', expiry: '2026.05.30', color: '#4A6CF7', status: 'available' },
    { id: 2, title: '경주 중앙시장 계기라', discount: '10% 할인', desc: '전통 시장 먹거리 10% 할인', expiry: '2026.06.15', color: '#10B981', status: 'available' },
    { id: 3, title: '안동하회 금류봉 보길', discount: '2,000원 할인', desc: '입장권 2,000원 할인', expiry: '2026.04.30', color: '#F59E0B', status: 'available' },
    { id: 4, title: '불국사 기념품점', discount: '5% 할인', desc: '기념품 5% 할인 (사용완료)', expiry: '2026.03.15', color: '#9CA3AF', status: 'used' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data, error } = await supabase
          .from('tg_user_coupons')
          .select('*, tg_coupons(title, discount, description, color, expiry_date)')
          .eq('user_id', DEMO_USER_ID)

        if (error) throw error

        // Map Supabase data to coupon card format
        const mappedCoupons = (data || [])
          .filter(uc => uc.tg_coupons)
          .map(userCoupon => ({
            id: userCoupon.coupon_id,
            title: userCoupon.tg_coupons.title,
            discount: userCoupon.tg_coupons.discount,
            desc: userCoupon.tg_coupons.description,
            expiry: (userCoupon.tg_coupons.expiry_date || '').replace(/-/g, '.'),
            color: userCoupon.tg_coupons.color || '#4A6CF7',
            status: userCoupon.status,
          }))

        setCoupons(mappedCoupons)
      } catch (err) {
        console.error('Error fetching coupons:', err)
        // Keep default coupons on error
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [])

  const filtered = coupons.filter(c => activeTab === 'available' ? c.status === 'available' : c.status === 'used')
  const availCount = coupons.filter(c => c.status === 'available').length
  const usedCount = coupons.filter(c => c.status === 'used').length

  return (
    <div style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={styles.header}>
        <i className="fa-solid fa-ticket" style={{ fontSize: 20, color: '#fff' }} />
        <h1 style={styles.title}>내 쿠폰함</h1>
        <p style={styles.subtitle}>NFC 태깅으로 받은 쿠폰을 확인하세요</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            ...styles.tab,
            borderBottom: activeTab === 'available' ? '2.5px solid #4A6CF7' : '2.5px solid transparent',
            color: activeTab === 'available' ? '#4A6CF7' : '#A0A0B8',
            fontWeight: activeTab === 'available' ? 700 : 400,
          }}
        >
          <i className="fa-solid fa-check-circle" style={{ fontSize: 12, marginRight: 4 }} />
          사용가능({availCount})
        </button>
        <button
          onClick={() => setActiveTab('used')}
          style={{
            ...styles.tab,
            borderBottom: activeTab === 'used' ? '2.5px solid #4A6CF7' : '2.5px solid transparent',
            color: activeTab === 'used' ? '#4A6CF7' : '#A0A0B8',
            fontWeight: activeTab === 'used' ? 700 : 400,
          }}
        >
          <i className="fa-solid fa-circle-check" style={{ fontSize: 12, marginRight: 4 }} />
          사용완료({usedCount})
        </button>
      </div>

      {/* Coupon Cards */}
      <div style={styles.section}>
        {filtered.map(c => (
          <div key={c.id} style={{ ...styles.couponCard, opacity: c.status === 'used' ? 0.55 : 1 }}>
            <div style={{ ...styles.colorStrip, background: c.color }} />
            <div style={styles.couponBody}>
              <div style={styles.couponTop}>
                <div>
                  <h3 style={styles.couponTitle}>{c.title}</h3>
                  <div style={{ ...styles.discountBadge, color: c.color, background: c.color + '15' }}>
                    <i className="fa-solid fa-percent" style={{ fontSize: 10, marginRight: 4 }} />
                    {c.discount}
                  </div>
                </div>
                <div style={styles.qrBox}>
                  <i className="fa-solid fa-qrcode" style={{ fontSize: 28, color: c.color }} />
                </div>
              </div>
              <p style={styles.couponDesc}>{c.desc}</p>
              <div style={styles.dashedLine} />
              <div style={styles.couponBottom}>
                <div style={styles.expiryRow}>
                  <i className="fa-regular fa-clock" style={{ fontSize: 11, color: '#A0A0B8' }} />
                  <span style={styles.expiryText}>유효기간: {c.expiry}까지</span>
                </div>
                {c.status === 'available' && (
                  <button style={{ ...styles.useBtn, background: c.color }}>
                    <i className="fa-solid fa-hand-pointer" style={{ fontSize: 10, marginRight: 4 }} />
                    사용하기
                  </button>
                )}
                {c.status === 'used' && (
                  <span style={styles.usedBadge}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 10, marginRight: 3 }} />
                    사용완료
                  </span>
                )}
              </div>
            </div>
            <div style={{ ...styles.notch, top: '50%', left: -8 }} />
            <div style={{ ...styles.notch, top: '50%', right: -8 }} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={styles.section}>
        <button style={styles.ctaBtn}>
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 14 }} />
          쿠폰 더 찾아보기
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 12 }} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={styles.infoBox}>
          <p style={{ fontSize: 12, color: '#8888A8', lineHeight: 1.6 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: '#F59E0B', marginRight: 4 }} />
            NFC 관광카드로 관광지를 태깅하면 주변 상점의 할인 쿠폰을 자동으로 받을 수 있어요!
          </p>
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
  tabRow: { display: 'flex', background: '#fff', borderBottom: '1px solid #F0F2F8' },
  tab: { flex: 1, padding: '14px', fontSize: 14, background: 'none', textAlign: 'center', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  section: { padding: '16px 20px' },
  couponCard: {
    background: '#fff', borderRadius: 16, marginBottom: 14,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', display: 'flex',
  },
  colorStrip: { width: 5, minHeight: '100%', flexShrink: 0 },
  couponBody: { flex: 1, padding: '16px 16px 14px' },
  couponTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  couponTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 },
  discountBadge: { display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 8 },
  qrBox: {
    width: 56, height: 56, borderRadius: 10, background: '#F8F9FE',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  couponDesc: { fontSize: 12, color: '#8888A8', marginBottom: 10 },
  dashedLine: { borderTop: '1.5px dashed #E8E8F0', margin: '0 -16px', padding: '0 16px', marginBottom: 10 },
  couponBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  expiryRow: { display: 'flex', alignItems: 'center', gap: 4 },
  expiryText: { fontSize: 11, color: '#A0A0B8' },
  useBtn: { color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center' },
  usedBadge: { fontSize: 12, color: '#A0A0B8', fontWeight: 500, display: 'flex', alignItems: 'center' },
  notch: { position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#F5F7FB', transform: 'translateY(-50%)' },
  ctaBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    width: '100%', background: '#fff', color: '#4A6CF7', fontSize: 14, fontWeight: 600,
    padding: '14px', borderRadius: 14, border: '1.5px solid #4A6CF7',
  },
  infoBox: { background: '#EBF0FF', borderRadius: 12, padding: '12px 14px' },
}
