/* global NDEFReader */
/**
 * NFC 태깅 서비스
 * - Web NFC API 지원 시 실제 NFC 사용
 * - 미지원 시 시뮬레이션 모드 (버튼/QR)
 */
import {
  db, DEMO_USER_ID, getById, getFiltered, updateById,
  setById, where, writeBatch, doc, collection,
} from './firebase'
import logger from './logger'

// Web NFC 지원 여부
export function isNfcSupported() {
  return typeof window !== 'undefined' && 'NDEFReader' in window
}

/**
 * NFC 태깅 처리 — 실제 비즈니스 로직
 * spotId로 관광지를 찾고, 스탬프 해제 + 태그 이력 + 유저 통계 갱신
 */
export async function processNfcTag(spotId, userId = DEMO_USER_ID) {
  logger.info('NFC', `태깅 처리 시작: spot=${spotId}, user=${userId}`)

  try {
    // 1. 관광지 정보 조회
    const spot = await getById('tg_spots', spotId)
    if (!spot) {
      logger.error('NFC', `관광지를 찾을 수 없음: ${spotId}`)
      return { success: false, error: '관광지를 찾을 수 없습니다.' }
    }

    // 2. 이미 태깅된 스탬프 확인
    const existingStamps = await getFiltered(
      'tg_stamps',
      where('user_id', '==', userId),
      where('spot_id', '==', spotId),
    )

    const alreadyUnlocked = existingStamps.length > 0 && existingStamps[0].unlocked
    const stampId = existingStamps.length > 0 ? existingStamps[0].id : `stamp-${userId}-${spotId}`

    // 3. 배치 쓰기로 원자적 업데이트
    const batch = writeBatch(db)
    const now = new Date().toISOString()

    // 3a. 스탬프 해제 (없으면 생성, 있으면 업데이트)
    const stampRef = doc(db, 'tg_stamps', stampId)
    batch.set(stampRef, {
      user_id: userId,
      spot_id: spotId,
      unlocked: true,
      spot_name: spot.name,
      spot_city: spot.city,
      spot_category: spot.category,
      unlocked_at: now,
    }, { merge: true })

    // 3b. 태그 이력 추가
    const tagRef = doc(collection(db, 'tg_tag_history'))
    batch.set(tagRef, {
      user_id: userId,
      spot_id: spotId,
      spot_name: spot.name,
      spot_city: spot.city,
      spot_category: spot.category,
      tagged_at: now,
    })

    await batch.commit()

    // 4. 유저 통계 갱신 (배치 외부에서 — 현재 값 필요)
    const user = await getById('tg_users', userId)
    if (user) {
      const visitedCities = new Set(user.visited_cities || [])
      visitedCities.add(spot.city)
      const newTotalTags = (user.total_tags || 0) + 1
      const allStamps = await getFiltered('tg_stamps', where('user_id', '==', userId), where('unlocked', '==', true))
      const allSpots = await getFiltered('tg_spots')
      const newColoringPct = allSpots.length > 0 ? Math.round((allStamps.length / allSpots.length) * 100) : 0

      await updateById('tg_users', userId, {
        total_tags: newTotalTags,
        visited_cities: [...visitedCities],
        map_coloring_pct: newColoringPct,
      })
    }

    // 5. 리더보드 점수 추가 (새 방문지 50점, 재방문 10점)
    const points = alreadyUnlocked ? 10 : 50
    const leader = await getById('tg_leaderboard', userId)
    if (leader) {
      await updateById('tg_leaderboard', userId, {
        score: (leader.score || 0) + points,
      })
    } else {
      await setById('tg_leaderboard', userId, {
        user_id: userId,
        score: points,
        rank_title: '경북 탐험가 Lv.1',
      })
    }

    logger.info('NFC', `태깅 성공: ${spot.name} (${spot.city}), +${points}점`, {
      spotId, spotName: spot.name, alreadyUnlocked, points,
    })

    return {
      success: true,
      spot,
      alreadyUnlocked,
      points,
      message: alreadyUnlocked
        ? `${spot.name}에 재방문! +${points}점`
        : `${spot.name} 스탬프 해제! +${points}점`,
    }
  } catch (err) {
    logger.error('NFC', '태깅 처리 실패', err)
    return { success: false, error: err.message || '태깅 처리 중 오류가 발생했습니다.' }
  }
}

/**
 * Web NFC 리더 시작 — 실제 NFC 하드웨어 사용
 * NFC 태그에 spotId가 NDEF Text 레코드로 기록되어 있다고 가정
 */
export async function startNfcReader(onTag) {
  if (!isNfcSupported()) {
    logger.warn('NFC', 'Web NFC API 미지원 — 시뮬레이션 모드 사용')
    return null
  }

  try {
    const ndef = new NDEFReader()
    await ndef.scan()
    logger.info('NFC', 'NFC 리더 활성화됨')

    ndef.addEventListener('reading', ({ serialNumber, message }) => {
      logger.info('NFC', `NFC 태그 감지: SN=${serialNumber}`)

      for (const record of message.records) {
        if (record.recordType === 'text') {
          const decoder = new TextDecoder(record.encoding || 'utf-8')
          const spotId = decoder.decode(record.data).trim()
          logger.info('NFC', `태그 데이터 파싱: spotId=${spotId}`)
          onTag(spotId)
          return
        }
        if (record.recordType === 'url') {
          const decoder = new TextDecoder()
          const url = decoder.decode(record.data)
          // URL 형식: https://tapgyeong-web.vercel.app/tag/spot-01
          const match = url.match(/\/tag\/(spot-\d+)/)
          if (match) {
            logger.info('NFC', `URL 태그 데이터: spotId=${match[1]}`)
            onTag(match[1])
            return
          }
        }
      }
      logger.warn('NFC', 'NFC 태그에서 spotId를 찾을 수 없음', { serialNumber })
    })

    ndef.addEventListener('readingerror', () => {
      logger.error('NFC', 'NFC 읽기 오류 발생')
    })

    return ndef
  } catch (err) {
    logger.error('NFC', 'NFC 리더 시작 실패', err)
    return null
  }
}
