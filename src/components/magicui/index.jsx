/**
 * Magic UI Inspired Components for TapGyeong
 * Animated components built with framer-motion
 * Key: prod_O4REWvflDgCtXp
 */
import { useState, useEffect, useRef, useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, useInView, useSpring, useMotionValue, animate, AnimatePresence } from 'framer-motion'

/* ══════════════════════════════════════════════════
   1. ANIMATED GRADIENT TEXT
   ══════════════════════════════════════════════════ */
export function AnimatedGradientText({ children, className = '', style = {}, colors = ['#4A6CF7', '#7DD3FC', '#A78BFA', '#4A6CF7'] }) {
  return (
    <>
      <style>{`
        @keyframes magicGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <span
        className={className}
        style={{
          background: `linear-gradient(90deg, ${colors.join(', ')})`,
          backgroundSize: '300% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'magicGradient 4s ease infinite',
          ...style,
        }}
      >
        {children}
      </span>
    </>
  )
}

/* ══════════════════════════════════════════════════
   2. NUMBER TICKER (Counting Animation)
   ══════════════════════════════════════════════════ */
export function NumberTicker({ value, decimals = 0, duration = 1.5, delay = 0, style = {}, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { duration: duration * 1000 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        animate(motionVal, typeof value === 'number' ? value : parseFloat(value) || 0, { duration })
      }, delay * 1000)
    }
  }, [isInView, value, duration, delay, motionVal])

  useEffect(() => {
    const unsub = springVal.on('change', v => {
      setDisplay(v.toFixed(decimals))
    })
    return unsub
  }, [springVal, decimals])

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{display}{suffix}
    </span>
  )
}

/* ══════════════════════════════════════════════════
   3. SHIMMER BUTTON
   ══════════════════════════════════════════════════ */
export function ShimmerButton({ children, onClick, style = {}, shimmerColor = 'rgba(255,255,255,0.3)', bgColor = '#4A6CF7' }) {
  return (
    <>
      <style>{`
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%);
          animation: shimmerSlide 2.5s ease-in-out infinite;
        }
        .shimmer-btn:active { transform: scale(0.97); }
      `}</style>
      <motion.button
        className="shimmer-btn"
        onClick={onClick}
        whileHover={{ scale: 1.03, boxShadow: `0 8px 30px ${bgColor}50` }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: bgColor, color: '#fff', border: 'none',
          padding: '14px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: `0 4px 20px ${bgColor}30`,
          transition: 'box-shadow 0.3s',
          ...style,
        }}
      >
        {children}
      </motion.button>
    </>
  )
}

/* ══════════════════════════════════════════════════
   4. BORDER BEAM (Animated border glow)
   ══════════════════════════════════════════════════ */
export function BorderBeam({ children, style = {}, borderRadius = 16, color1 = '#4A6CF7', color2 = '#7DD3FC', duration = 4 }) {
  // eslint-disable-next-line react-hooks/purity
  const id = useMemo(() => 'bb-' + Math.random().toString(36).slice(2, 8), [])
  return (
    <>
      <style>{`
        @keyframes borderBeamRotate-${id} {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .border-beam-${id} {
          position: relative; border-radius: ${borderRadius}px;
        }
        .border-beam-${id}::before {
          content: ''; position: absolute; inset: -2px;
          border-radius: ${borderRadius + 2}px;
          background: linear-gradient(90deg, ${color1}, ${color2}, ${color1}, ${color2});
          background-size: 300% 300%;
          animation: borderBeamRotate-${id} ${duration}s ease infinite;
          z-index: -1;
        }
      `}</style>
      <div className={`border-beam-${id}`} style={{ background: '#fff', borderRadius, ...style }}>
        {children}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   5. BLUR FADE (Scroll-triggered fade in)
   ══════════════════════════════════════════════════ */
export function BlurFade({ children, delay = 0, direction = 'up', blur = 8, duration = 0.6, style = {} }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const dirMap = { up: { y: 24 }, down: { y: -24 }, left: { x: 24 }, right: { x: -24 } }
  const initial = { opacity: 0, filter: `blur(${blur}px)`, ...dirMap[direction] }
  const animateTo = { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? animateTo : initial}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════
   6. MAGIC CARD (Hover spotlight effect)
   ══════════════════════════════════════════════════ */
export function MagicCard({ children, style = {}, glowColor = 'rgba(74,108,247,0.12)', borderRadius = 16 }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const ref = useRef(null)

  function handleMove(e) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(74,108,247,0.15)' }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative', overflow: 'hidden',
        background: '#fff', borderRadius,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {hovering && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, ${glowColor}, transparent 70%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════
   7. MARQUEE (Infinite scroll)
   ══════════════════════════════════════════════════ */
export function Marquee({ children, speed = 30, direction = 'left', pauseOnHover = true, style = {} }) {
  // eslint-disable-next-line react-hooks/purity
  const id = useMemo(() => 'mq-' + Math.random().toString(36).slice(2, 8), [])
  const dir = direction === 'left' ? '' : 'reverse'
  return (
    <>
      <style>{`
        @keyframes marqueeScroll-${id} {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-${id} { overflow: hidden; ${style.width ? '' : 'width: 100%;'} }
        .marquee-track-${id} {
          display: flex; width: max-content;
          animation: marqueeScroll-${id} ${speed}s linear infinite ${dir};
        }
        ${pauseOnHover ? `.marquee-${id}:hover .marquee-track-${id} { animation-play-state: paused; }` : ''}
      `}</style>
      <div className={`marquee-${id}`} style={style}>
        <div className={`marquee-track-${id}`}>
          <div style={{ display: 'flex', gap: 12 }}>{children}</div>
          <div style={{ display: 'flex', gap: 12 }}>{children}</div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   8. PULSATING BUTTON (For CTA / NFC)
   ══════════════════════════════════════════════════ */
export function PulsatingButton({ children, onClick, style = {}, pulseColor = '#4A6CF7' }) {
  return (
    <>
      <style>{`
        @keyframes magicPulse {
          0% { box-shadow: 0 0 0 0 ${pulseColor}60; }
          70% { box-shadow: 0 0 0 16px ${pulseColor}00; }
          100% { box-shadow: 0 0 0 0 ${pulseColor}00; }
        }
      `}</style>
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: pulseColor, color: '#fff', border: 'none',
          padding: '14px 28px', borderRadius: 14, fontSize: 15, fontWeight: 700,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          animation: 'magicPulse 2s ease-in-out infinite',
          ...style,
        }}
      >
        {children}
      </motion.button>
    </>
  )
}

/* ══════════════════════════════════════════════════
   9. SPARKLES TEXT
   ══════════════════════════════════════════════════ */
export function SparklesText({ children, style = {}, color = '#FFD700' }) {
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(prev => {
        const now = Date.now()
        const filtered = prev.filter(s => now - s.created < 800)
        if (filtered.length < 4) {
          filtered.push({
            id: now,
            created: now,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 8 + 4,
          })
        }
        return filtered
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {sparkles.map(s => (
        <motion.span
          key={s.id}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            color, fontSize: s.size,
            pointerEvents: 'none', zIndex: 2,
          }}
        >
          ✦
        </motion.span>
      ))}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </span>
  )
}

/* ══════════════════════════════════════════════════
   10. PARTICLES BACKGROUND
   ══════════════════════════════════════════════════ */
export function Particles({ count = 30, color = '#4A6CF7', style = {} }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      // eslint-disable-next-line react-hooks/purity
      x: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      y: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      size: Math.random() * 3 + 1,
      // eslint-disable-next-line react-hooks/purity
      duration: Math.random() * 15 + 10,
      // eslint-disable-next-line react-hooks/purity
      delay: Math.random() * 5,
    })), [count])

  return (
    <>
      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.5; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
        }
      `}</style>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
        ...style,
      }}>
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: color,
              opacity: 0.4,
              animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   11. NEON GRADIENT CARD
   ══════════════════════════════════════════════════ */
export function NeonGradientCard({ children, style = {}, borderRadius = 20, neonColors = ['#4A6CF7', '#7DD3FC'] }) {
  // eslint-disable-next-line react-hooks/purity
  const id = useMemo(() => 'nc-' + Math.random().toString(36).slice(2, 8), [])
  return (
    <>
      <style>{`
        .neon-card-${id} {
          position: relative; border-radius: ${borderRadius}px;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
        }
        .neon-card-${id}::before {
          content: ''; position: absolute; inset: -3px;
          border-radius: ${borderRadius + 3}px;
          background: linear-gradient(135deg, ${neonColors[0]}, ${neonColors[1]});
          z-index: -1; filter: blur(8px); opacity: 0.5;
        }
        .neon-card-${id}::after {
          content: ''; position: absolute; inset: -1px;
          border-radius: ${borderRadius + 1}px;
          background: linear-gradient(135deg, ${neonColors[0]}, ${neonColors[1]});
          z-index: -1;
        }
      `}</style>
      <div className={`neon-card-${id}`} style={style}>
        {children}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   12. TYPING ANIMATION
   ══════════════════════════════════════════════════ */
export function TypingAnimation({ texts = [], speed = 80, pause = 2000, style = {} }) {
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIndex] || ''
    let timeout

    if (!isDeleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(c => c + 1), speed)
    } else if (!isDeleting && charIndex === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pause)
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(c => c - 1), speed / 2)
    } else if (isDeleting && charIndex === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setTextIndex(i => (i + 1) % texts.length)
      }, 300)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, textIndex, texts, speed, pause])

  const current = texts[textIndex] || ''

  return (
    <span style={style}>
      {current.slice(0, charIndex)}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        style={{ display: 'inline-block', width: 2, height: '1em', background: 'currentColor', marginLeft: 2, verticalAlign: 'text-bottom' }}
      />
    </span>
  )
}

/* ══════════════════════════════════════════════════
   13. STAGGER CONTAINER (Children animate in sequence)
   ══════════════════════════════════════════════════ */
export function StaggerContainer({ children, staggerDelay = 0.08, style = {} }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, style = {} }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════
   14. SHINE BORDER
   ══════════════════════════════════════════════════ */
export function ShineBorder({ children, style = {}, borderRadius = 16, color = '#4A6CF7', borderWidth = 2, duration = 3 }) {
  // eslint-disable-next-line react-hooks/purity
  const id = useMemo(() => 'sb-' + Math.random().toString(36).slice(2, 8), [])
  return (
    <>
      <style>{`
        @keyframes shineSpin-${id} {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .shine-border-${id} {
          position: relative; overflow: hidden; border-radius: ${borderRadius}px;
          background: #fff; padding: ${borderWidth}px;
        }
        .shine-border-${id}::before {
          content: ''; position: absolute;
          width: 200%; height: 200%;
          top: -50%; left: -50%;
          background: conic-gradient(from 0deg, transparent 0%, ${color} 10%, transparent 20%);
          animation: shineSpin-${id} ${duration}s linear infinite;
          z-index: 0;
        }
        .shine-border-inner-${id} {
          position: relative; z-index: 1;
          background: #fff; border-radius: ${borderRadius - borderWidth}px;
        }
      `}</style>
      <div className={`shine-border-${id}`} style={style}>
        <div className={`shine-border-inner-${id}`}>
          {children}
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   15. ANIMATED PROGRESS BAR
   ══════════════════════════════════════════════════ */
export function AnimatedProgress({ value = 0, max = 100, color = '#4A6CF7', height = 8, style = {} }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div ref={ref} style={{ width: '100%', height, borderRadius: height / 2, background: '#F0F2F8', overflow: 'hidden', ...style }}>
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2 }}
        style={{
          height: '100%', borderRadius: height / 2,
          background: `linear-gradient(90deg, ${color}, ${color}CC)`,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  )
}
