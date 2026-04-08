/**
 * Firestore seed script for TapGyeong
 *
 * PREREQUISITE: Update Firestore security rules to allow writes.
 * Go to Firebase Console > Firestore > Rules and set:
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /{document=**} {
 *         allow read, write: if true;
 *       }
 *     }
 *   }
 *
 * Then run: node scripts/seed-firestore.mjs
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBPk_rn5Bo-sxHBHBjjAR0R00KCD3SfkLI',
  authDomain: 'tapgyeong.firebaseapp.com',
  projectId: 'tapgyeong',
  storageBucket: 'tapgyeong.firebasestorage.app',
  messagingSenderId: '646265861357',
  appId: '1:646265861357:web:7390dd0fec1becb32848e4',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ========== tg_spots ==========
const spots = [
  { id: 'spot-01', name: '석굴암', city: '경주', category: '문화유산', lat: 35.7959, lng: 129.3595, description: '유네스코 세계문화유산, 신라 불교 예술의 걸작' },
  { id: 'spot-02', name: '불국사', city: '경주', category: '문화유산', lat: 35.7902, lng: 129.3322, description: '신라 시대 대표 사찰, 세계문화유산' },
  { id: 'spot-03', name: '첨성대', city: '경주', category: '문화유산', lat: 35.8346, lng: 129.2190, description: '동양 최고(最古)의 천문관측대' },
  { id: 'spot-04', name: '대릉원', city: '경주', category: '문화유산', lat: 35.8359, lng: 129.2114, description: '신라 왕릉 23기가 모여있는 고분 공원' },
  { id: 'spot-05', name: '동궁과 월지', city: '경주', category: '문화유산', lat: 35.8318, lng: 129.2265, description: '안압지로 유명한 신라 왕궁 연못' },
  { id: 'spot-06', name: '경주 교촌마을', city: '경주', category: '전통마을', lat: 35.8347, lng: 129.2137, description: '한옥 체험과 전통문화를 즐길 수 있는 마을' },
  { id: 'spot-07', name: '황리단길', city: '경주', category: '핫플레이스', lat: 35.8370, lng: 129.2120, description: '트렌디한 카페와 맛집이 모인 거리' },
  { id: 'spot-08', name: '보문관광단지', city: '경주', category: '관광단지', lat: 35.8413, lng: 129.2803, description: '호텔, 놀이공원, 골프장 등 종합 리조트' },
  { id: 'spot-09', name: '하회마을', city: '안동', category: '전통마을', lat: 36.5397, lng: 128.5176, description: '유네스코 세계문화유산, 600년 역사의 전통마을' },
  { id: 'spot-10', name: '도산서원', city: '안동', category: '문화유산', lat: 36.7275, lng: 128.8375, description: '퇴계 이황 선생의 학문과 덕행을 기리는 서원' },
  { id: 'spot-11', name: '안동 찜닭골목', city: '안동', category: '맛집', lat: 36.5684, lng: 128.7292, description: '안동의 대표 먹거리, 찜닭 원조 골목' },
  { id: 'spot-12', name: '월영교', city: '안동', category: '관광명소', lat: 36.5600, lng: 128.7305, description: '한국에서 가장 긴 목조 다리, 야경 명소' },
  { id: 'spot-13', name: '봉정사', city: '안동', category: '문화유산', lat: 36.6456, lng: 128.7445, description: '한국에서 가장 오래된 목조건물이 있는 사찰' },
  { id: 'spot-14', name: '맘모스빵집', city: '안동', category: '맛집', lat: 36.5684, lng: 128.7256, description: '안동 명물 크림치즈빵으로 유명한 빵집' },
  { id: 'spot-15', name: '호미곶', city: '포항', category: '관광명소', lat: 36.0769, lng: 129.5680, description: '한반도 최동단, 일출 명소' },
  { id: 'spot-16', name: '죽도시장', city: '포항', category: '전통시장', lat: 36.0194, lng: 129.3658, description: '동해안 최대 전통시장, 해산물의 천국' },
  { id: 'spot-17', name: '영일대 해수욕장', city: '포항', category: '자연', lat: 36.0561, lng: 129.3781, description: '포항 대표 해수욕장, 불꽃축제로 유명' },
  { id: 'spot-18', name: '구룡포 일본인 가옥거리', city: '포항', category: '역사거리', lat: 35.9878, lng: 129.5533, description: '일제강점기 건축물이 남아있는 역사 거리' },
  { id: 'spot-19', name: '이가리 닻 전망대', city: '포항', category: '관광명소', lat: 36.0700, lng: 129.5600, description: '바다 위 닻 모양 전망대, 인생샷 명소' },
  { id: 'spot-20', name: '포항 운하', city: '포항', category: '관광명소', lat: 36.0231, lng: 129.3652, description: '도심 속 운하, 야경이 아름다운 산책로' },
]

// ========== tg_users (demo user) ==========
const demoUser = {
  nickname: '여행자',
  profile_image: null,
  kakao_id: null,
  total_tags: 12,
  visited_cities: ['경주', '안동', '포항'],
  map_coloring_pct: 35,
  level: 3,
}

// ========== tg_stamps (demo user's stamps) ==========
const stamps = [
  { id: 'stamp-01', user_id: 'demo-user', spot_id: 'spot-01', unlocked: true, spot_name: '석굴암', spot_city: '경주', spot_category: '문화유산' },
  { id: 'stamp-02', user_id: 'demo-user', spot_id: 'spot-02', unlocked: true, spot_name: '불국사', spot_city: '경주', spot_category: '문화유산' },
  { id: 'stamp-03', user_id: 'demo-user', spot_id: 'spot-03', unlocked: true, spot_name: '첨성대', spot_city: '경주', spot_category: '문화유산' },
  { id: 'stamp-04', user_id: 'demo-user', spot_id: 'spot-05', unlocked: true, spot_name: '동궁과 월지', spot_city: '경주', spot_category: '문화유산' },
  { id: 'stamp-05', user_id: 'demo-user', spot_id: 'spot-07', unlocked: true, spot_name: '황리단길', spot_city: '경주', spot_category: '핫플레이스' },
  { id: 'stamp-06', user_id: 'demo-user', spot_id: 'spot-09', unlocked: true, spot_name: '하회마을', spot_city: '안동', spot_category: '전통마을' },
  { id: 'stamp-07', user_id: 'demo-user', spot_id: 'spot-10', unlocked: true, spot_name: '도산서원', spot_city: '안동', spot_category: '문화유산' },
  { id: 'stamp-08', user_id: 'demo-user', spot_id: 'spot-11', unlocked: true, spot_name: '안동 찜닭골목', spot_city: '안동', spot_category: '맛집' },
  { id: 'stamp-09', user_id: 'demo-user', spot_id: 'spot-15', unlocked: true, spot_name: '호미곶', spot_city: '포항', spot_category: '관광명소' },
  { id: 'stamp-10', user_id: 'demo-user', spot_id: 'spot-16', unlocked: true, spot_name: '죽도시장', spot_city: '포항', spot_category: '전통시장' },
  { id: 'stamp-11', user_id: 'demo-user', spot_id: 'spot-04', unlocked: false, spot_name: '대릉원', spot_city: '경주', spot_category: '문화유산' },
  { id: 'stamp-12', user_id: 'demo-user', spot_id: 'spot-12', unlocked: false, spot_name: '월영교', spot_city: '안동', spot_category: '관광명소' },
]

// ========== tg_tag_history ==========
const tagHistory = [
  { id: 'tag-01', user_id: 'demo-user', spot_id: 'spot-15', tagged_at: '2026-04-07T14:30:00Z', spot_name: '호미곶', spot_city: '포항', spot_category: '관광명소' },
  { id: 'tag-02', user_id: 'demo-user', spot_id: 'spot-16', tagged_at: '2026-04-07T11:20:00Z', spot_name: '죽도시장', spot_city: '포항', spot_category: '전통시장' },
  { id: 'tag-03', user_id: 'demo-user', spot_id: 'spot-09', tagged_at: '2026-04-06T15:00:00Z', spot_name: '하회마을', spot_city: '안동', spot_category: '전통마을' },
  { id: 'tag-04', user_id: 'demo-user', spot_id: 'spot-11', tagged_at: '2026-04-06T12:30:00Z', spot_name: '안동 찜닭골목', spot_city: '안동', spot_category: '맛집' },
  { id: 'tag-05', user_id: 'demo-user', spot_id: 'spot-01', tagged_at: '2026-04-05T10:00:00Z', spot_name: '석굴암', spot_city: '경주', spot_category: '문화유산' },
  { id: 'tag-06', user_id: 'demo-user', spot_id: 'spot-02', tagged_at: '2026-04-05T13:00:00Z', spot_name: '불국사', spot_city: '경주', spot_category: '문화유산' },
  { id: 'tag-07', user_id: 'demo-user', spot_id: 'spot-03', tagged_at: '2026-04-05T15:30:00Z', spot_name: '첨성대', spot_city: '경주', spot_category: '문화유산' },
  { id: 'tag-08', user_id: 'demo-user', spot_id: 'spot-05', tagged_at: '2026-04-05T17:00:00Z', spot_name: '동궁과 월지', spot_city: '경주', spot_category: '문화유산' },
  { id: 'tag-09', user_id: 'demo-user', spot_id: 'spot-07', tagged_at: '2026-04-04T14:00:00Z', spot_name: '황리단길', spot_city: '경주', spot_category: '핫플레이스' },
  { id: 'tag-10', user_id: 'demo-user', spot_id: 'spot-10', tagged_at: '2026-04-03T11:00:00Z', spot_name: '도산서원', spot_city: '안동', spot_category: '문화유산' },
  { id: 'tag-11', user_id: 'demo-user', spot_id: 'spot-14', tagged_at: '2026-04-03T13:00:00Z', spot_name: '맘모스빵집', spot_city: '안동', spot_category: '맛집' },
  { id: 'tag-12', user_id: 'demo-user', spot_id: 'spot-17', tagged_at: '2026-04-02T16:00:00Z', spot_name: '영일대 해수욕장', spot_city: '포항', spot_category: '자연' },
]

// ========== tg_leaderboard ==========
const leaderboard = {
  user_id: 'demo-user',
  score: 1250,
  rank_title: '경북 탐험가 Lv.3',
}

// ========== tg_user_coupons (denormalized with coupon info) ==========
const userCoupons = [
  { id: 'uc-01', user_id: 'demo-user', coupon_id: 'coupon-01', status: 'available', title: '경주 교촌마을 한복체험', discount: '30% 할인', description: '전통 한복 체험 30% 할인 쿠폰', color: '#4A6CF7', expiry_date: '2026-06-30' },
  { id: 'uc-02', user_id: 'demo-user', coupon_id: 'coupon-02', status: 'available', title: '안동 찜닭골목 맛집', discount: '5,000원 할인', description: '안동 찜닭 원조맛집 5,000원 할인 쿠폰', color: '#F59E0B', expiry_date: '2026-05-31' },
  { id: 'uc-03', user_id: 'demo-user', coupon_id: 'coupon-03', status: 'used', title: '포항 죽도시장 과메기', discount: '3,000원 할인', description: '죽도시장 과메기 세트 3,000원 할인', color: '#10B981', expiry_date: '2026-04-30' },
  { id: 'uc-04', user_id: 'demo-user', coupon_id: 'coupon-04', status: 'available', title: '보문관광단지 자전거', discount: '무료 1시간', description: '보문관광단지 자전거 대여 1시간 무료', color: '#8B5CF6', expiry_date: '2026-07-31' },
  { id: 'uc-05', user_id: 'demo-user', coupon_id: 'coupon-05', status: 'available', title: '하회마을 입장권', discount: '50% 할인', description: '하회마을 입장료 50% 할인 쿠폰', color: '#EF4444', expiry_date: '2026-08-31' },
]

// ========== SEED FUNCTION ==========
async function seed() {
  console.log('Seeding Firestore...\n')

  // Seed spots (use writeBatch for efficiency)
  console.log('Seeding tg_spots...')
  const batch1 = writeBatch(db)
  for (const spot of spots) {
    const { id, ...data } = spot
    batch1.set(doc(db, 'tg_spots', id), data)
  }
  await batch1.commit()
  console.log(`  ${spots.length} spots created`)

  // Seed demo user
  console.log('Seeding tg_users...')
  await setDoc(doc(db, 'tg_users', 'demo-user'), demoUser)
  console.log('  Demo user created')

  // Seed stamps
  console.log('Seeding tg_stamps...')
  const batch2 = writeBatch(db)
  for (const stamp of stamps) {
    const { id, ...data } = stamp
    batch2.set(doc(db, 'tg_stamps', id), data)
  }
  await batch2.commit()
  console.log(`  ${stamps.length} stamps created`)

  // Seed tag history
  console.log('Seeding tg_tag_history...')
  const batch3 = writeBatch(db)
  for (const tag of tagHistory) {
    const { id, ...data } = tag
    batch3.set(doc(db, 'tg_tag_history', id), data)
  }
  await batch3.commit()
  console.log(`  ${tagHistory.length} tag history entries created`)

  // Seed leaderboard
  console.log('Seeding tg_leaderboard...')
  await setDoc(doc(db, 'tg_leaderboard', 'demo-user'), leaderboard)
  console.log('  Leaderboard entry created')

  // Seed user coupons
  console.log('Seeding tg_user_coupons...')
  const batch4 = writeBatch(db)
  for (const uc of userCoupons) {
    const { id, ...data } = uc
    batch4.set(doc(db, 'tg_user_coupons', id), data)
  }
  await batch4.commit()
  console.log(`  ${userCoupons.length} user coupons created`)

  console.log('\nSeeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err.message || err)
  process.exit(1)
})