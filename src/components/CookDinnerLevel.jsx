import { useState, useRef, useEffect, useCallback } from 'react'

const GAME_WIDTH = 960
const GAME_HEIGHT = 540

const SCENES = ['CUTTING', 'DEEP_FRY', 'STEAK', 'ASPARAGUS', 'PLATING', 'CANDLE_WINE']
const SCENE_TITLES = {
  CUTTING: 'Cut the potato!',
  DEEP_FRY: 'Fry the fries!',
  STEAK: 'Cook the steak!',
  ASPARAGUS: 'Cook the asparagus!',
  PLATING: 'Plate up!',
  CANDLE_WINE: 'Light the night',
}

function Draggable({ children, onDrop, disabled, style, className = '' }) {
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const elRef = useRef(null)

  const handlePointerDown = (e) => {
    if (disabled) return
    e.preventDefault()
    startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const move = (e) => setPosition({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y })
    const up = (e) => {
      const el = elRef.current
      if (el) {
        el.style.pointerEvents = 'none'
        el.style.visibility = 'hidden'
      }
      const target = document.elementFromPoint(e.clientX, e.clientY)
      const dropEl = target?.closest('[data-drop-target]')
      const dropId = dropEl?.dataset?.dropId ?? null
      if (el) {
        el.style.pointerEvents = ''
        el.style.visibility = ''
      }
      setDragging(false)
      onDrop?.(dropId)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [dragging, onDrop])

  return (
    <div
      ref={elRef}
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      style={{
        ...style,
        position: dragging ? 'fixed' : undefined,
        left: dragging ? position.x : undefined,
        top: dragging ? position.y : undefined,
        cursor: disabled ? 'default' : dragging ? 'grabbing' : 'grab',
        zIndex: dragging ? 1000 : undefined,
        touchAction: 'none',
      }}
      className={className}
    >
      {children}
    </div>
  )
}

function SceneFrame({ title, children, className = '' }) {
  return (
    <div className={`cook-scene ${className}`}>
      <div className="cook-scene__title">{title}</div>
      <div className="cook-scene__body">{children}</div>
    </div>
  )
}

const REQUIRED_CUTS = 12
const CUT_COOLDOWN_MS = 120

function CuttingScene({ onComplete }) {
  const [cuts, setCuts] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const lastCutTime = useRef(0)

  const addCut = useCallback(() => {
    const now = Date.now()
    if (now - lastCutTime.current < CUT_COOLDOWN_MS) return
    lastCutTime.current = now
    setCuts((c) => {
      const next = c + 1
      if (next >= REQUIRED_CUTS) {
        setCelebrate(true)
        setTimeout(() => onComplete?.(), 1200)
      }
      return next
    })
  }, [onComplete])

  const handlePointerUp = useCallback(() => {
    addCut()
  }, [addCut])

  return (
    <SceneFrame title={SCENE_TITLES.CUTTING}>
      <div className="cook-scene__cutting">
        <div
          className="cook-scene__potato-zone"
          onPointerUp={handlePointerUp}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addCut(); } }}
        >
          <span className="cook-scene__potato">{'\u{1F954}'}</span>
          <span className="cook-scene__potato">{'\u{1F954}'}</span>
          <span className="cook-scene__potato">{'\u{1F954}'}</span>
        </div>
        <div className="cook-scene__knife">{'\u{1F52A}'}</div>
        <div className="cook-scene__progress">
          <div className="cook-scene__progress-fill" style={{ width: `${(cuts / REQUIRED_CUTS) * 100}%` }} />
          <span>{cuts}/{REQUIRED_CUTS}</span>
        </div>
        {celebrate && <div className="cook-scene__feedback cook-scene__feedback--good">Mama clap!</div>}
      </div>
    </SceneFrame>
  )
}

const DEEP_FRY_COOK_TIME = 3500
const DEEP_FRY_BURN_TIME = 5200

function DeepFryScene({ onComplete }) {
  const [friesIn, setFriesIn] = useState(false)
  const [ready, setReady] = useState(false)
  const [alarm, setAlarm] = useState(false)
  const [removed, setRemoved] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (!friesIn) return
    const start = Date.now()
    const t = setInterval(() => {
      const e = Date.now() - start
      setElapsed(e)
      if (e >= DEEP_FRY_COOK_TIME && !ready) {
        setReady(true)
        setAlarm(true)
        setShake(true)
        setTimeout(() => setShake(false), 400)
      }
    }, 100)
    return () => clearInterval(t)
  }, [friesIn, ready])

  const handleDrop = (dropId) => {
    if (dropId === 'fryer' && !friesIn) setFriesIn(true)
  }

  const handleBasketClick = () => {
    if (ready && !removed) {
      setRemoved(true)
      setTimeout(() => onComplete?.(), 600)
    }
  }

  const fryColor = !friesIn ? '#f5e6c8' : elapsed < DEEP_FRY_COOK_TIME ? '#e6c84a' : elapsed < DEEP_FRY_BURN_TIME ? '#c49b2d' : '#8b6914'

  return (
    <SceneFrame title={SCENE_TITLES.DEEP_FRY} className={shake ? 'cook-scene--shake' : ''}>
      <div className="cook-scene__deepfry">
        {!friesIn && (
          <Draggable onDrop={handleDrop} className="cook-scene__draggable cook-scene__fry-pile" style={{ left: '50%', top: '20%', transform: 'translate(-50%,0)' }}>
            {'\u{1F35F}'} Fries
          </Draggable>
        )}
        <div
          data-drop-target
          data-drop-id="fryer"
          className={`cook-scene__fryer ${alarm ? 'cook-scene__fryer--alarm' : ''}`}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={handleBasketClick}
            onKeyDown={(e) => e.key === 'Enter' && handleBasketClick()}
            className="cook-scene__fryer-basket"
            style={{ background: fryColor }}
          >
            {friesIn ? (removed ? 'Empty' : 'Fries') : 'Basket'}
          </div>
        </div>
        <div className="cook-scene__bubbles" />
      </div>
    </SceneFrame>
  )
}

const STEAK_SIDE_COOK = 2000
const STEAK_FLIP_WINDOW_CENTER = 2000
const STEAK_FLIP_WINDOW_RADIUS = 400

function SteakScene({ onComplete }) {
  const [steaksIn, setSteaksIn] = useState(0)
  const [flipPrompt, setFlipPrompt] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [result, setResult] = useState(null)
  const startRef = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (steaksIn !== 2) return
    startRef.current = Date.now()
  }, [steaksIn])

  useEffect(() => {
    if (steaksIn !== 2 || flipped) return
    const t = setInterval(() => {
      const e = Date.now() - (startRef.current ?? Date.now())
      setElapsed(e)
      if (e >= STEAK_FLIP_WINDOW_CENTER - STEAK_FLIP_WINDOW_RADIUS) setFlipPrompt(true)
    }, 100)
    return () => clearInterval(t)
  }, [steaksIn, flipped])

  useEffect(() => {
    if (!flipped) return
    setTimeout(() => onComplete?.(), 800)
  }, [flipped, onComplete])

  const handleDrop = (dropId) => {
    if (dropId === 'pan') setSteaksIn((n) => Math.min(2, n + 1))
  }

  const handleFlip = () => {
    if (!flipPrompt || flipped) return
    const e = elapsed
    const inWindow = Math.abs(e - STEAK_FLIP_WINDOW_CENTER) <= STEAK_FLIP_WINDOW_RADIUS
    setResult(inWindow ? 'Perfect!' : e < STEAK_FLIP_WINDOW_CENTER ? 'Early' : 'Late')
    setFlipped(true)
  }

  return (
    <SceneFrame title={SCENE_TITLES.STEAK}>
      <div className="cook-scene__steak">
        {steaksIn === 0 && (
          <Draggable onDrop={handleDrop} className="cook-scene__draggable" style={{ left: '25%', top: '35%' }}>
            {'\u{1F969}'} Steak
          </Draggable>
        )}
        {steaksIn === 1 && (
          <Draggable onDrop={handleDrop} className="cook-scene__draggable" style={{ left: '55%', top: '35%' }}>
            {'\u{1F969}'} Steak
          </Draggable>
        )}
        <div data-drop-target data-drop-id="pan" className="cook-scene__pan">
          Pan {steaksIn >= 1 && '\u{1F969}'} {steaksIn >= 2 && '\u{1F969}'}
        </div>
        {steaksIn === 2 && (
          <button type="button" className="cook-scene__flip-btn" onClick={handleFlip}>
            {flipPrompt ? 'FLIP!' : 'Wait...'}
          </button>
        )}
        {result && <div className="cook-scene__feedback cook-scene__feedback--good">{result}</div>}
      </div>
    </SceneFrame>
  )
}

const ASPARAGUS_COOK = 1500
const ASPARAGUS_BURN = 2300

function AsparagusScene({ onComplete }) {
  const [inPan, setInPan] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!inPan) return
    const start = Date.now()
    const t = setInterval(() => {
      const e = Date.now() - start
      setElapsed(e)
      if (e >= ASPARAGUS_COOK) setTimeout(() => onComplete?.(), 600)
    }, 100)
    return () => clearInterval(t)
  }, [inPan, onComplete])

  const handleDrop = (dropId) => {
    if (dropId === 'pan') setInPan(true)
  }

  const color = !inPan ? '#2d5a27' : elapsed < ASPARAGUS_COOK ? '#3d7a37' : elapsed < ASPARAGUS_BURN ? '#4a9a44' : '#5c4033'

  return (
    <SceneFrame title={SCENE_TITLES.ASPARAGUS}>
      <div className="cook-scene__asparagus">
        {!inPan && (
          <Draggable onDrop={handleDrop} className="cook-scene__draggable" style={{ left: '50%', top: '25%', transform: 'translate(-50%,0)' }}>
            {'\u{1F966}'} Asparagus
          </Draggable>
        )}
        <div data-drop-target data-drop-id="pan" className="cook-scene__pan">
          {inPan && <span style={{ color }}>{'\u{1F966}'}</span>}
        </div>
      </div>
    </SceneFrame>
  )
}

function PlatingScene({ onComplete }) {
  const [plate1, setPlate1] = useState([])
  const [plate2, setPlate2] = useState([])
  const ITEMS = ['steak', 'fries', 'asparagus']

  const addToPlate = (plateNum, item) => {
    const setter = plateNum === 1 ? setPlate1 : setPlate2
    setter((p) => (p.length < 3 && !p.includes(item) ? [...p, item] : p))
  }

  useEffect(() => {
    const full = (p) => p.length === 3 && ITEMS.every((i) => p.includes(i))
    if (full(plate1) && full(plate2)) setTimeout(() => onComplete?.(), 800)
  }, [plate1, plate2, onComplete])

  return (
    <SceneFrame title={SCENE_TITLES.PLATING}>
      <div className="cook-scene__plating">
        <div className="cook-scene__plate" data-drop-target data-drop-id="plate1">
          <div className="cook-scene__plate-label">Plate 1</div>
          {plate1.map((x) => <span key={x}>{x}</span>)}
          {ITEMS.map((item) => (
            <button key={item} type="button" className="cook-scene__plate-btn" onClick={() => addToPlate(1, item)} disabled={plate1.includes(item) || plate1.length >= 3}>
              +{item}
            </button>
          ))}
        </div>
        <div className="cook-scene__plate" data-drop-target data-drop-id="plate2">
          <div className="cook-scene__plate-label">Plate 2</div>
          {plate2.map((x) => <span key={x}>{x}</span>)}
          {ITEMS.map((item) => (
            <button key={item} type="button" className="cook-scene__plate-btn" onClick={() => addToPlate(2, item)} disabled={plate2.includes(item) || plate2.length >= 3}>
              +{item}
            </button>
          ))}
        </div>
      </div>
    </SceneFrame>
  )
}

function CandleWineScene({ onComplete }) {
  const [candleLit, setCandleLit] = useState(false)
  const [glass1, setGlass1] = useState(false)
  const [glass2, setGlass2] = useState(false)

  useEffect(() => {
    if (candleLit && glass1 && glass2) setTimeout(() => onComplete?.(), 1000)
  }, [candleLit, glass1, glass2, onComplete])

  return (
    <SceneFrame title={SCENE_TITLES.CANDLE_WINE}>
      <div className="cook-scene__candle-wine">
        <button type="button" className="cook-scene__candle-btn" onClick={() => setCandleLit(true)} disabled={candleLit}>
          {candleLit ? '\u{1F56F}' : '\u{1F56E}'}
        </button>
        <button type="button" className="cook-scene__wine-btn" onClick={() => setGlass1(true)} disabled={glass1}>
          {glass1 ? '\u{1F377} Full' : '\u{1F377} Glass 1'}
        </button>
        <button type="button" className="cook-scene__wine-btn" onClick={() => setGlass2(true)} disabled={glass2}>
          {glass2 ? '\u{1F377} Full' : '\u{1F377} Glass 2'}
        </button>
      </div>
    </SceneFrame>
  )
}

export function CookDinnerLevel({ onComplete }) {
  const [sceneIndex, setSceneIndex] = useState(0)
  const scene = SCENES[sceneIndex]

  const goNext = useCallback(() => {
    if (sceneIndex >= SCENES.length - 1) {
      onComplete?.()
    } else {
      setSceneIndex((i) => i + 1)
    }
  }, [sceneIndex, onComplete])

  return (
    <div className="cook-dinner-level" style={{ position: 'relative', width: GAME_WIDTH, height: GAME_HEIGHT }}>
      {scene === 'CUTTING' && <CuttingScene onComplete={goNext} />}
      {scene === 'DEEP_FRY' && <DeepFryScene onComplete={goNext} />}
      {scene === 'STEAK' && <SteakScene onComplete={goNext} />}
      {scene === 'ASPARAGUS' && <AsparagusScene onComplete={goNext} />}
      {scene === 'PLATING' && <PlatingScene onComplete={goNext} />}
      {scene === 'CANDLE_WINE' && <CandleWineScene onComplete={goNext} />}
    </div>
  )
}
