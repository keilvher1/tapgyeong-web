/**
 * TapGyeong 개발자 디버그 로거
 * - 콘솔 + Firestore tg_logs 컬렉션에 로그 저장
 * - 관리자 페이지에서 실시간 로그 조회 가능
 */
import { createDoc } from './firebase'

const MAX_MEMORY_LOGS = 500

// 메모리 내 로그 저장소
const memoryLogs = []

function pushLog(entry) {
  memoryLogs.push(entry)
  if (memoryLogs.length > MAX_MEMORY_LOGS) memoryLogs.shift()
}

// Firestore에 로그 저장 (비동기, 실패해도 무시)
async function persistLog(entry) {
  try {
    await createDoc('tg_logs', entry)
  } catch {
    // 로그 저장 실패 시 무시 (무한 루프 방지)
  }
}

function createEntry(level, category, message, data = null) {
  return {
    level,
    category,
    message,
    data: data ? JSON.parse(JSON.stringify(data)) : null,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  }
}

const logger = {
  info(category, message, data) {
    const entry = createEntry('info', category, message, data)
    console.log(`%c[${category}] ${message}`, 'color: #4A6CF7; font-weight: bold', data || '')
    pushLog(entry)
    persistLog(entry)
  },

  warn(category, message, data) {
    const entry = createEntry('warn', category, message, data)
    console.warn(`[${category}] ${message}`, data || '')
    pushLog(entry)
    persistLog(entry)
  },

  error(category, message, data) {
    const entry = createEntry('error', category, message, data)
    const errorData = data instanceof Error
      ? { name: data.name, message: data.message, stack: data.stack }
      : data
    entry.data = errorData
    console.error(`[${category}] ${message}`, data || '')
    pushLog(entry)
    persistLog({ ...entry, data: errorData })
  },

  // 메모리 내 로그 가져오기
  getLogs() {
    return [...memoryLogs]
  },

  clear() {
    memoryLogs.length = 0
  },
}

// 전역 에러 핸들러
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    logger.error('GLOBAL', `Uncaught: ${e.message}`, {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    })
  })

  window.addEventListener('unhandledrejection', (e) => {
    logger.error('GLOBAL', `Unhandled Promise: ${e.reason?.message || e.reason}`, {
      stack: e.reason?.stack,
    })
  })
}

export default logger
