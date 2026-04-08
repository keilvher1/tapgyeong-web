import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'

const quickPrompts = [
  { emoji: '🏛️', label: '경주 문화유산 코스', prompt: '경주에서 문화유산 위주로 당일치기 코스 추천해줘' },
  { emoji: '🍜', label: '안동 맛집 투어', prompt: '안동 맛집 투어 1박2일 코스 추천해줘' },
  { emoji: '🌊', label: '포항 힐링 코스', prompt: '포항에서 바다 보면서 힐링할 수 있는 코스 추천해줘' },
  { emoji: '📸', label: '인스타 핫플', prompt: '경북 3개 도시(경주, 안동, 포항)에서 인스타 감성 사진 찍기 좋은 핫플 코스 추천해줘' },
]

export default function AiRecommend() {
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '안녕하세요! 🎒 탭경 AI 여행 도우미입니다.\n\n경주, 안동, 포항의 맞춤형 여행 코스를 추천해드릴게요. 여행 스타일, 일정, 관심사를 알려주시면 딱 맞는 코스를 만들어드립니다!\n\n아래 버튼을 눌러 빠르게 시작해보세요 👇'
      }
    ]
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleQuickPrompt = (prompt) => {
    setInput(prompt)
    setTimeout(() => {
      const form = document.getElementById('ai-chat-form')
      if (form) form.requestSubmit()
    }, 50)
  }

  const showQuickPrompts = messages.length <= 1

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', height: '100vh',
      display: 'flex', flexDirection: 'column', background: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', background: 'linear-gradient(135deg, #4A6CF7 0%, #7DD3FC 100%)',
        color: 'white', display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
        }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>AI 코스 추천</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>경북 맞춤형 여행 플래너</div>
        </div>
        <div style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: 20,
          background: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 500
        }}>
          <i className="fa-solid fa-bolt" style={{ marginRight: 4 }}></i>Powered by AI
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
        display: 'flex', flexDirection: 'column', gap: 12
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', marginRight: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'white', marginTop: 2
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '12px 16px', borderRadius: 16,
              fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              ...(msg.role === 'user' ? {
                background: 'linear-gradient(135deg, #4A6CF7, #6C8CFF)',
                color: 'white', borderBottomRightRadius: 4
              } : {
                background: 'white', color: '#1e293b',
                borderBottomLeftRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              })
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4A6CF7, #7DD3FC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'white'
            }}>🤖</div>
            <div style={{
              padding: '12px 16px', borderRadius: 16, background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: 4
            }}>
              <span className="dot-bounce" style={{ animationDelay: '0s' }}>●</span>
              <span className="dot-bounce" style={{ animationDelay: '0.15s' }}>●</span>
              <span className="dot-bounce" style={{ animationDelay: '0.3s' }}>●</span>
            </div>
          </div>
        )}

        {/* Quick Prompts */}
        {showQuickPrompts && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {quickPrompts.map((qp, i) => (
              <button key={i} onClick={() => handleQuickPrompt(qp.prompt)} style={{
                padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0',
                background: 'white', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.background = '#f0f4ff' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white' }}
              >
                <span style={{ fontSize: 22 }}>{qp.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{qp.label}</span>
                <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}></i>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form id="ai-chat-form" onSubmit={handleSubmit} style={{
        padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: 'white',
        display: 'flex', gap: 8, alignItems: 'center'
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder="여행 스타일, 일정을 알려주세요..."
          disabled={isLoading}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid #e2e8f0',
            fontSize: 14, outline: 'none', background: '#f8fafc',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#4A6CF7'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button type="submit" disabled={isLoading || !input.trim()} style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: (!input.trim() || isLoading) ? '#cbd5e1' : 'linear-gradient(135deg, #4A6CF7, #6C8CFF)',
          color: 'white', fontSize: 16, cursor: (!input.trim() || isLoading) ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', flexShrink: 0
        }}>
          <i className={isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'}></i>
        </button>
      </form>

      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        .dot-bounce {
          display: inline-block;
          color: #4A6CF7;
          font-size: 10px;
          animation: dotBounce 1.2s infinite;
        }
      `}</style>
    </div>
  )
}
