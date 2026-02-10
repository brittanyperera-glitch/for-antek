import { useState, useRef, useEffect, useCallback } from 'react'

const WORLD_WIDTH = 1000
const WORLD_HEIGHT = 1600
/* Portrait 9:16 (Doodle Jump style) – no stretch */
const VIEW_WIDTH = 360
const VIEW_HEIGHT = 640
const FLOOR_Y = WORLD_HEIGHT - 80
const INITIAL_CAMERA_Y = Math.max(0, FLOOR_Y - VIEW_HEIGHT)
const INITIAL_CAMERA_X = Math.max(0, Math.min(80 - VIEW_WIDTH / 2, WORLD_WIDTH - VIEW_WIDTH))
const FLOOR_HEIGHT = 80
const CHICKEN_W = 32
const CHICKEN_H = 36
const GRAVITY = 0.55
const JUMP_FORCE = -14.5
const WALK_SPEED = 3.2
const MAX_FALL_SPEED = 12
const AIR_CONTROL = 0.85
const HEART_SIZE = 24
const EGG_W = 14
const EGG_H = 18
const EGG_SPEED_MIN = 3.5
const EGG_SPEED_MAX = 6.5
const EGG_SPAWN_MIN_MS = 400
const EGG_SPAWN_MAX_MS = 900

/* Vertical spacing ~55–65px between platform bottoms so chicken can single/double jump to each */
const PLATFORMS_INITIAL = [
  { x: 150, y: FLOOR_Y - 80, w: 120, h: 20 },
  { x: 400, y: FLOOR_Y - 145, w: 100, h: 20 },
  { x: 620, y: FLOOR_Y - 210, w: 90, h: 20 },
  { x: 280, y: FLOOR_Y - 275, w: 100, h: 20 },
  { x: 500, y: FLOOR_Y - 340, w: 110, h: 20 },
  { x: 120, y: FLOOR_Y - 405, w: 130, h: 20 },
  { x: 380, y: FLOOR_Y - 470, w: 120, h: 20 },
  { x: 650, y: FLOOR_Y - 535, w: 90, h: 20 },
  { x: 340, y: FLOOR_Y - 600, w: 130, h: 20 },
]

const PLATFORM_MOVE_SPEED = 16
const MOVING_PLATFORM_RANGE = 80

const HEARTS_INITIAL = [
  { id: 0, x: 200, y: FLOOR_Y - 30 },
  { id: 1, x: 500, y: FLOOR_Y - 30 },
  { id: 2, x: 450, y: FLOOR_Y - 157 },
  { id: 3, x: 330, y: FLOOR_Y - 287 },
  { id: 4, x: 570, y: FLOOR_Y - 352 },
]

const HEARTS_TO_WIN = 5

const JUMP_SOUND_SRC = '/Cartoon%20Jump%20Sound%20Effect.mp3'
const SPLAT_SOUND_SRC = '/Cartoon%20Splat%20sound%20effect.mp3'
const COIN_SOUND_SRC = '/Mario%20Coin%20Sound%20-%20Sound%20Effect%20%28HD%29.mp3'

function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

export function HeartsGame({ onComplete }) {
  const [chicken, setChicken] = useState({ x: 80, y: FLOOR_Y - CHICKEN_H, vx: 0, vy: 0 })
  const [heartsCollected, setHeartsCollected] = useState([])
  const [platforms, setPlatforms] = useState(() => PLATFORMS_INITIAL.map((p) => ({ ...p })))
  const [popupMoving, setPopupMoving] = useState(false)
  const [eggs, setEggs] = useState([])
  const [dead, setDead] = useState(false)
  const [deathShake, setDeathShake] = useState(false)
  const [deathFlash, setDeathFlash] = useState(false)
  const [cameraY, setCameraY] = useState(INITIAL_CAMERA_Y)
  const [cameraX, setCameraX] = useState(INITIAL_CAMERA_X)
  const keysRef = useRef({ left: false, right: false, up: false, down: false })
  const gameRef = useRef(null)
  const viewportRef = useRef(null)
  const prevHeartsCountRef = useRef(0)
  const eggIdRef = useRef(0)
  const nextSpawnAtRef = useRef(0)
  const chickenRef = useRef(chicken)
  const eggsRef = useRef(eggs)
  const platformsRef = useRef(platforms)
  const wonRef = useRef(false)
  chickenRef.current = chicken
  eggsRef.current = eggs
  platformsRef.current = platforms
  wonRef.current = heartsCollected.length >= HEARTS_TO_WIN

  const jumpSoundRef = useRef(null)
  const splatSoundRef = useRef(null)
  const coinSoundRef = useRef(null)

  const playJumpSound = useCallback(() => {
    const el = jumpSoundRef.current
    if (!el) return
    el.currentTime = 0
    el.volume = 0.4
    el.play().catch(() => {})
  }, [])
  const playSplatSound = useCallback(() => {
    const el = splatSoundRef.current
    if (!el) return
    el.currentTime = 0
    el.volume = 0.5
    el.play().catch(() => {})
  }, [])
  const playCoinSound = useCallback(() => {
    const el = coinSoundRef.current
    if (!el) return
    el.currentTime = 0
    el.volume = 0.4
    el.play().catch(() => {})
  }, [])

  useEffect(() => {
    ;[jumpSoundRef, splatSoundRef, coinSoundRef].forEach((ref) => {
      const el = ref.current
      if (el && el.src) el.load()
    })
  }, [])

  const allHearts = HEARTS_INITIAL
  const collectedSet = new Set(heartsCollected)
  const heartsLeft = allHearts.filter((h) => !collectedSet.has(h.id))

  const collectHeart = useCallback(
    (id) => {
      setHeartsCollected((prev) => {
        if (prev.includes(id)) return prev
        playCoinSound()
        return [...prev, id]
      })
    },
    [playCoinSound]
  )

  const handleTryAgain = useCallback(() => {
    setDead(false)
    setEggs([])
    setChicken({ x: 80, y: FLOOR_Y - CHICKEN_H, vx: 0, vy: 0 })
    setHeartsCollected([])
    setPlatforms(PLATFORMS_INITIAL.map((p) => ({ ...p })))
    setCameraY(INITIAL_CAMERA_Y)
    setCameraX(INITIAL_CAMERA_X)
    setDeathShake(false)
    setDeathFlash(false)
  }, [])

  useEffect(() => {
    if (heartsCollected.length >= 3 && prevHeartsCountRef.current < 3) {
      setPopupMoving(true)
      const t = setTimeout(() => setPopupMoving(false), 2500)
      setPlatforms((prev) =>
        prev.map((p, i) => ({
          ...p,
          dx: i % 2 === 0 ? 1 : -1,
          minX: Math.max(0, p.x - MOVING_PLATFORM_RANGE),
          maxX: Math.min(WORLD_WIDTH - p.w, p.x + MOVING_PLATFORM_RANGE),
        }))
      )
      return () => clearTimeout(t)
    }
    prevHeartsCountRef.current = heartsCollected.length
  }, [heartsCollected.length])

  /* Always capture arrow keys when game is mounted – no focus check */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'ArrowLeft') keysRef.current.left = true
      if (e.key === 'ArrowRight') keysRef.current.right = true
      if (e.key === 'ArrowUp') keysRef.current.up = true
      if (e.key === 'ArrowDown') keysRef.current.down = true
    }
    const handleKeyUp = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'ArrowLeft') keysRef.current.left = false
      if (e.key === 'ArrowRight') keysRef.current.right = false
      if (e.key === 'ArrowUp') keysRef.current.up = false
      if (e.key === 'ArrowDown') keysRef.current.down = false
    }
    const opts = { capture: true }
    window.addEventListener('keydown', handleKeyDown, opts)
    window.addEventListener('keyup', handleKeyUp, opts)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, opts)
      window.removeEventListener('keyup', handleKeyUp, opts)
    }
  }, [])


  useEffect(() => {
    if (dead) return
    let rafId
    let jumpCount = 0
    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 2)
      lastTime = now

      const c = chickenRef.current
      const k = keysRef.current
      let moveX = 0
      if (k.left) moveX = -WALK_SPEED
      if (k.right) moveX = WALK_SPEED
      const jumpPressed = k.up

      let vx = c.vx
      let vy = c.vy
      vy += GRAVITY * dt
      if (vy > MAX_FALL_SPEED) vy = MAX_FALL_SPEED

      let x = c.x + vx * dt
      let y = c.y + vy * dt

      const chickenBottom = y + CHICKEN_H
      const platList = platformsRef.current
      let onGround = false
      let standingOnDx = 0

      if (chickenBottom >= FLOOR_Y - 2 && chickenBottom <= FLOOR_Y + 50) {
        onGround = true
        y = FLOOR_Y - CHICKEN_H
        vy = 0
      }
      for (const p of platList) {
        const chickLeft = x
        const chickRight = x + CHICKEN_W
        const chickBottom = y + CHICKEN_H
        const platLeft = p.x
        const platRight = p.x + p.w
        const platBottom = p.y + p.h
        if (
          chickBottom >= platBottom - 2 &&
          chickBottom <= platBottom + 14 &&
          c.y + CHICKEN_H <= platBottom + 2 &&
          chickLeft < platRight &&
          chickRight > platLeft &&
          vy >= 0
        ) {
          y = platBottom - CHICKEN_H
          vy = 0
          onGround = true
          if (p.dx != null) standingOnDx = p.dx * (dt / 16.67) * PLATFORM_MOVE_SPEED
        }
      }

      x += standingOnDx

      if (onGround) {
        jumpCount = 0
        vx = moveX
      } else {
        vx = vx * (1 - AIR_CONTROL) + moveX * AIR_CONTROL
      }

      if (jumpPressed && (onGround || jumpCount < 1)) {
        if (!onGround) jumpCount += 1
        vy = JUMP_FORCE
        playJumpSound()
      }

      x = Math.max(0, Math.min(WORLD_WIDTH - CHICKEN_W, x))
      y = Math.max(0, Math.min(WORLD_HEIGHT - CHICKEN_H, y))

      const newChicken = { x, y, vx, vy }

      const dtNorm = dt
      const nextPlatforms = platList.map((p) => {
        if (p.dx == null) return p
        const speed = PLATFORM_MOVE_SPEED * (dtNorm / 16.67)
        let newX = p.x + p.dx * speed
        let newDx = p.dx
        if (newX <= p.minX) {
          newX = p.minX
          newDx = -p.dx
        } else if (newX >= p.maxX - p.w) {
          newX = p.maxX - p.w
          newDx = -p.dx
        }
        return { ...p, x: newX, dx: newDx }
      })
      setPlatforms(nextPlatforms)

      if (!wonRef.current && nextSpawnAtRef.current > 0 && now >= nextSpawnAtRef.current) {
        nextSpawnAtRef.current =
          now + EGG_SPAWN_MIN_MS + Math.random() * (EGG_SPAWN_MAX_MS - EGG_SPAWN_MIN_MS)
        setEggs((prev) => {
          const id = eggIdRef.current++
          const ex = 80 + Math.random() * (WORLD_WIDTH - 160)
          const speed = EGG_SPEED_MIN + Math.random() * (EGG_SPEED_MAX - EGG_SPEED_MIN)
          return [...prev, { id, x: ex, y: -24, vy: speed }]
        })
      }

      const nextEggs = wonRef.current
        ? eggsRef.current
        : eggsRef.current
            .map((egg) => ({ ...egg, y: egg.y + egg.vy * dtNorm }))
            .filter((egg) => egg.y < WORLD_HEIGHT + 50)

      let hitByEgg = false
      for (const egg of nextEggs) {
        const ex = egg.x - EGG_W / 2
        const ey = egg.y - EGG_H / 2
        if (rectOverlap(newChicken.x, newChicken.y, CHICKEN_W, CHICKEN_H, ex, ey, EGG_W, EGG_H)) {
          hitByEgg = true
          break
        }
      }

      if (hitByEgg) {
        playSplatSound()
        setDeathShake(true)
        setDeathFlash(true)
        setTimeout(() => setDeathShake(false), 150)
        setTimeout(() => {
          setDeathFlash(false)
          setDead(true)
        }, 200)
        setEggs([])
      } else {
        setChicken(newChicken)
        setEggs(nextEggs)
        const targetCy = Math.max(0, Math.min(newChicken.y - VIEW_HEIGHT * 0.5, WORLD_HEIGHT - VIEW_HEIGHT))
        const targetCx = Math.max(0, Math.min(newChicken.x - VIEW_WIDTH / 2, WORLD_WIDTH - VIEW_WIDTH))
        setCameraY(Math.round(targetCy))
        setCameraX(Math.round(targetCx))
      }

      rafId = requestAnimationFrame(tick)
    }

    if (nextSpawnAtRef.current === 0) {
      nextSpawnAtRef.current =
        performance.now() + EGG_SPAWN_MIN_MS + Math.random() * (EGG_SPAWN_MAX_MS - EGG_SPAWN_MIN_MS)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [dead, playJumpSound, playSplatSound])


  useEffect(() => {
    const c = chicken
    for (const h of HEARTS_INITIAL) {
      if (heartsCollected.includes(h.id)) continue
      const hx = h.x - HEART_SIZE / 2
      const hy = h.y - HEART_SIZE / 2
      if (rectOverlap(c.x, c.y, CHICKEN_W, CHICKEN_H, hx, hy, HEART_SIZE, HEART_SIZE)) {
        collectHeart(h.id)
      }
    }
  }, [chicken.x, chicken.y, heartsCollected, collectHeart])

  const collectedCount = heartsCollected.length
  const allHeartsCollected = collectedCount >= HEARTS_TO_WIN

  const [viewSize, setViewSize] = useState({ w: WORLD_WIDTH, h: VIEW_HEIGHT })
  useEffect(() => {
    if (!viewportRef.current) return
    const el = viewportRef.current
    const update = () => {
      if (!el) return
      const w = Math.max(el.clientWidth || WORLD_WIDTH, 320)
      const h = Math.max(el.clientHeight || VIEW_HEIGHT, 240)
      setViewSize({ w, h: Math.min(h, VIEW_HEIGHT * 2) })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [])

  const safeW = Math.max(viewSize.w, 320)
  const safeH = Math.max(viewSize.h, 240)
  /* Uniform scale so we never stretch; letterbox instead */
  const scale = Math.min(safeW / VIEW_WIDTH, safeH / VIEW_HEIGHT)
  const gameWindowW = VIEW_WIDTH * scale
  const gameWindowH = VIEW_HEIGHT * scale

  return (
    <div
      className={`hearts-game__viewport${deathShake ? ' hearts-game__viewport--shake' : ''}${deathFlash ? ' hearts-game__viewport--flash' : ''}`}
      ref={viewportRef}
      tabIndex={0}
      role="application"
      aria-label="Hearts game: use arrow keys to move and jump"
      onPointerDown={() => { viewportRef.current?.focus() }}
    >
      <div
        className="hearts-game__game-window"
        style={{
          width: gameWindowW,
          height: gameWindowH,
        }}
      >
        <div className="hearts-game__flip-wrapper">
          <div
            className="hearts-game"
            ref={gameRef}
            style={{
              width: WORLD_WIDTH,
              height: WORLD_HEIGHT,
              transform: `translate(${-cameraX}px, ${-cameraY}px) scale(${scale})`,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
            data-camera-y={cameraY}
            data-visible-y-end={cameraY + VIEW_HEIGHT}
          >
        <div className="hearts-game__sky" aria-hidden />
        <div
          className="hearts-game__floor"
          style={{ left: 0, right: 0, bottom: 0, height: FLOOR_HEIGHT, top: 'auto' }}
        />
        {platforms.map((p, i) => (
          <div
            key={i}
            className="hearts-game__platform"
            style={{
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
            }}
          />
        ))}
        {eggs.map((egg) => (
          <div
            key={egg.id}
            className="hearts-game__egg"
            style={{
              left: egg.x - EGG_W / 2,
              top: egg.y - EGG_H / 2,
              width: EGG_W,
              height: EGG_H,
            }}
            aria-hidden
          />
        ))}
        {heartsLeft.map((h) => (
          <div
            key={h.id}
            className="hearts-game__heart"
            style={{
              left: h.x - HEART_SIZE / 2,
              top: h.y - HEART_SIZE / 2,
              width: HEART_SIZE,
              height: HEART_SIZE,
            }}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="hearts-game__heart-svg" fill="#E63946" stroke="#C1121F" strokeWidth="1.2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        ))}
        <div
          className={`hearts-game__chicken${allHeartsCollected ? ' hearts-game__chicken--celebrate' : ''}${Math.abs(chicken.vy) > 2 ? ' hearts-game__chicken--air' : ''}${chicken.vx < -0.5 ? ' hearts-game__chicken--left' : ''}`}
          style={{
            left: chicken.x,
            top: chicken.y,
            width: CHICKEN_W,
            height: CHICKEN_H,
          }}
          data-chicken-x={chicken.x}
          data-chicken-y={chicken.y}
          aria-hidden
        >
          <svg viewBox="0 0 32 36" className="hearts-game__chicken-svg" fill="none">
            <ellipse cx="14" cy="24" rx="9" ry="9" fill="#FFF8E7" stroke="#2B2B2B" strokeWidth="1.5" />
            <circle cx="22" cy="14" r="7" fill="#FFF8E7" stroke="#2B2B2B" strokeWidth="1.5" />
            <path d="M28 14 L32 12 L28 16 Z" fill="#FFD23F" stroke="#2B2B2B" strokeWidth="1" strokeLinejoin="round" />
            <path d="M21 8 L23 4 L25 6 L27 4 L29 8 L27 10 L25 8 L23 10 Z" fill="#E63946" stroke="#2B2B2B" strokeWidth="0.8" />
            <circle cx="24" cy="13" r="1.8" fill="#2B2B2B" />
          </svg>
        </div>
      </div>
      </div>
      <div className="hearts-game__counter" aria-live="polite">
        Hearts: {collectedCount}/{HEARTS_TO_WIN}
      </div>
      {popupMoving && (
        <div className="hearts-game__popup hearts-game__popup--moving" role="status" aria-live="polite">
          Moving platforms!
        </div>
      )}
      {dead && (
        <div className="hearts-game__death-overlay" role="status" aria-live="polite">
          <p className="hearts-game__death-message">Hit by an egg!</p>
          <button
            type="button"
            className="hearts-game__death-try-again"
            onClick={handleTryAgain}
            aria-label="Try again"
          >
            Try again
          </button>
        </div>
      )}
      <audio ref={jumpSoundRef} src={JUMP_SOUND_SRC} preload="auto" />
      <audio ref={splatSoundRef} src={SPLAT_SOUND_SRC} preload="auto" />
      <audio ref={coinSoundRef} src={COIN_SOUND_SRC} preload="auto" />
      {allHeartsCollected && (
        <div className="hearts-game__complete" role="dialog" aria-label="Level complete">
          <div className="hearts-game__sparkles" aria-hidden>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} className="hearts-game__sparkle" style={{ '--i': i }} />
            ))}
          </div>
          <div className="hearts-game__complete-title-box">
            <h2 className="hearts-game__complete-title">congrats! 5 hearts? I only need yours.</h2>
          </div>
          <p className="hearts-game__complete-text">
            You did it.
          </p>
          <button
            type="button"
            className="hearts-game__complete-btn"
            onClick={onComplete}
            aria-label="Proceed to the final level"
          >
            <span className="hearts-game__complete-arrow" aria-hidden>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </span>
            <span className="hearts-game__complete-btn-label">proceed to the final level.</span>
          </button>
        </div>
      )}
      <p className="hearts-game__hint" aria-live="polite">
        Use arrow keys to move and jump. Avoid eggs. Hearts: {collectedCount}/{HEARTS_TO_WIN}
      </p>
      </div>
    </div>
  )
}
