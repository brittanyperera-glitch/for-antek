import { useState, useRef, useCallback } from 'react'

const BG_CREAM = '#FFF7E8'
const SHELF_WOOD = '#C98E5A'
const BASKET_RED = '#D94141'
const BASKET_INNER = '#FBEAEA'
const ACCENT_GREEN = '#6EC1A6'
const ACCENT_YELLOW = '#FFD166'
const TEXT_DARK = '#3A2F2F'

const CORRECT_INGREDIENTS = [
  { id: 'steak', label: 'Raw steak', emoji: '\u{1F969}' },
  { id: 'potatoes', label: 'Potatoes', emoji: '\u{1F954}' },
  { id: 'butter', label: 'Butter', emoji: '\u{1F9C8}' },
  { id: 'garlic', label: 'Garlic', emoji: '\u{1F9C4}' },
  { id: 'salt', label: 'Salt', emoji: '\u{1F9C2}' },
  { id: 'oil', label: 'Oil', emoji: '\u{1FAD2}' },
  { id: 'asparagus', label: 'Asparagus', emoji: '\u{1F966}' },
  { id: 'wine', label: 'Red wine', emoji: '\u{1F377}' },
]

const DECOY_INGREDIENTS = [
  { id: 'chocolate', label: 'Chocolate', emoji: '\u{1F36B}' },
  { id: 'milk', label: 'Milk', emoji: '\u{1F95B}' },
  { id: 'banana', label: 'Banana', emoji: '\u{1F34C}' },
  { id: 'cookies', label: 'Cookies', emoji: '\u{1F36A}' },
  { id: 'soda', label: 'Soda', emoji: '\u{1F964}' },
  { id: 'cheese', label: 'Cheese', emoji: '\u{1F9C0}' },
  { id: 'jam', label: 'Jam', emoji: '\u{1FAD9}' },
  { id: 'cereal', label: 'Cereal', emoji: '\u{1F95C}' },
  { id: 'candy', label: 'Candy', emoji: '\u{1F36C}' },
  { id: 'icecream', label: 'Ice cream', emoji: '\u{1F368}' },
  { id: 'chips', label: 'Chips', emoji: '\u{1F35F}' },
  { id: 'ketchup', label: 'Ketchup', emoji: '\u{1F965}' },
  { id: 'mustard', label: 'Mustard', emoji: '\u{1F96B}' },
  { id: 'honey', label: 'Honey', emoji: '\u{1F36F}' },
  { id: 'peanutbutter', label: 'Peanut butter', emoji: '\u{1F96C}' },
]

const correctIds = new Set(CORRECT_INGREDIENTS.map((i) => i.id))
const ALL_ITEMS = [
  ...CORRECT_INGREDIENTS.map((i) => ({ ...i, correct: true })),
  ...DECOY_INGREDIENTS.map((i) => ({ ...i, correct: false })),
]

const SHELF_ROWS = 3
const getShelfRow = (index) => index % SHELF_ROWS
const getSlotOffset = (index) => {
  const row = getShelfRow(index)
  const col = Math.floor(index / SHELF_ROWS)
  return { offsetX: (col % 5) * 6 - 8, offsetY: row * 3 - 2 }
}

const CORRECT_SOUND_SRC = '/CORRECT%20ANSWER%20SOUND%20EFFECT%20_%20NO%20COPYRIGHT.mp3'
const WRONG_SOUND_SRC = '/Nope%20sound%20effect.mp3'
const COIN_SOUND_SRC = '/Mario%20Coin%20Sound%20-%20Sound%20Effect%20%28HD%29.mp3'

export function ShoppingGame({ onComplete }) {
  const [collected, setCollected] = useState([])
  const [listOpen, setListOpen] = useState(false)
  const [basketHighlight, setBasketHighlight] = useState(null) // 'correct' | 'wrong' | null
  const [rejectTooltip, setRejectTooltip] = useState(false)
  const [won, setWon] = useState(false)
  const [basketShake, setBasketShake] = useState(false)
  const [draggingCorrect, setDraggingCorrect] = useState(null)
  const correctSoundRef = useRef(null)
  const wrongSoundRef = useRef(null)
  const coinSoundRef = useRef(null)

  const playCorrect = useCallback(() => {
    const el = correctSoundRef.current || coinSoundRef.current
    if (el) {
      el.volume = 0.4
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }, [])
  const playWrong = useCallback(() => {
    const el = wrongSoundRef.current
    if (el) {
      el.volume = 0.45
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }, [])

  const collectedSet = new Set(collected)
  const shelfItems = ALL_ITEMS.filter((item) => !collectedSet.has(item.id))

  const handleDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, correct: item.correct }))
    setDraggingCorrect(item.correct)
  }

  const handleDragEnd = () => {
    setDraggingCorrect(null)
    setBasketHighlight(null)
  }

  const handleDragOverBasket = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setBasketHighlight(draggingCorrect === true ? 'correct' : draggingCorrect === false ? 'wrong' : null)
  }

  const handleDragLeaveBasket = () => {
    setBasketHighlight(null)
  }

  const handleDropBasket = (e) => {
    e.preventDefault()
    setBasketHighlight(null)
    setDraggingCorrect(null)
    const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain')
    let id
    let correct
    try {
      const parsed = JSON.parse(raw)
      id = parsed.id
      correct = parsed.correct
    } catch {
      id = raw
      correct = correctIds.has(id)
    }
    if (collectedSet.has(id)) return
    if (correct) {
      setCollected((prev) => [...prev, id])
      playCorrect()
      if (collected.length + 1 >= CORRECT_INGREDIENTS.length) setWon(true)
    } else {
      setBasketShake(true)
      setTimeout(() => setBasketShake(false), 400)
      setRejectTooltip(true)
      setTimeout(() => setRejectTooltip(false), 2000)
      playWrong()
    }
  }

  const handleListToggle = () => setListOpen((o) => !o)

  const isCollected = (id) => collectedSet.has(id)

  return (
    <div
      className="shopping-game"
      style={{ '--bg-cream': BG_CREAM, '--shelf-wood': SHELF_WOOD, '--basket-red': BASKET_RED, '--basket-inner': BASKET_INNER, '--accent-green': ACCENT_GREEN, '--accent-yellow': ACCENT_YELLOW, '--text-dark': TEXT_DARK }}
    >
      <div className="shopping-game__inner">
        <h2 className="shopping-game__level-title">Go Shopping for The First Dinner You Ever Made Me!</h2>
        <p className="shopping-game__subtitle">Pick the right ingredients… no pressure</p>

        <button
          type="button"
          className="shopping-game__list-btn"
          onClick={handleListToggle}
          aria-expanded={listOpen}
          aria-label={listOpen ? 'Close shopping list' : 'Open shopping list'}
        >
          <span className="shopping-game__list-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </span>
          <span className="shopping-game__list-pulse" aria-hidden />
        </button>

        {listOpen && (
          <div className="shopping-game__list-overlay" role="dialog" aria-label="Shopping list">
            <div className="shopping-game__list-panel">
              <h3 className="shopping-game__list-title">Shopping List</h3>
              <ul className="shopping-game__list-items">
                {CORRECT_INGREDIENTS.map((item) => (
                  <li
                    key={item.id}
                    className={`shopping-game__list-item ${isCollected(item.id) ? 'shopping-game__list-item--done' : ''}`}
                  >
                    <span className="shopping-game__list-check" aria-hidden />
                    <span className="shopping-game__list-label">{item.label}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="shopping-game__list-close" onClick={handleListToggle}>
                Close
              </button>
            </div>
          </div>
        )}

        <div className="shopping-game__main">
          <div className="shopping-game__shelves">
            {[0, 1, 2].map((row) => (
              <div key={row} className="shopping-game__shelf" aria-hidden>
                <div className="shopping-game__shelf-board" />
                <div className="shopping-game__shelf-items">
                  {shelfItems
                    .map((item, i) => ({ item, i }))
                    .filter(({ i }) => getShelfRow(i) === row)
                    .map(({ item, i }) => {
                      const { offsetX, offsetY } = getSlotOffset(i)
                      return (
                        <div
                          key={item.id}
                          className="shopping-game__item"
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                          style={{ '--ox': `${offsetX}px`, '--oy': `${offsetY}px` }}
                          data-correct={item.correct}
                          role="button"
                          tabIndex={0}
                          aria-label={`Drag ${item.label} to trolley`}
                        >
                          <span className="shopping-game__item-emoji">{item.emoji}</span>
                          <span className="shopping-game__item-label">{item.label}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="shopping-game__basket-zone">
            <p className="shopping-game__drag-hint">Drag to the trolley</p>
            <div
              className={`shopping-game__basket ${basketHighlight ? `shopping-game__basket--${basketHighlight}` : ''} ${basketShake ? 'shopping-game__basket--shake' : ''}`}
              onDragOver={handleDragOverBasket}
              onDragLeave={handleDragLeaveBasket}
              onDrop={handleDropBasket}
              role="region"
              aria-label="Shopping trolley drop zone"
            >
              <div className="shopping-game__basket-inner">
                {collected.map((id) => {
                  const item = ALL_ITEMS.find((i) => i.id === id)
                  if (!item) return null
                  return (
                    <span key={id} className="shopping-game__basket-item" title={item.label}>
                      {item.emoji}
                    </span>
                  )
                })}
              </div>
            </div>
            {rejectTooltip && (
              <p className="shopping-game__reject-tooltip" role="status">
                Hmm… I don&apos;t think that was for dinner
              </p>
            )}
          </div>
        </div>
      </div>

      {won && (
        <div className="shopping-game__win" role="dialog" aria-label="Level complete">
          <div className="shopping-game__win-dim" />
          <div className="shopping-game__win-sparkles" aria-hidden>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span key={i} className="shopping-game__win-sparkle" style={{ '--i': i }} />
            ))}
          </div>
          <div className="shopping-game__win-box">
            <p className="shopping-game__win-message">Perfect. Dinner&apos;s on me next time</p>
            <button
              type="button"
              className="shopping-game__win-btn"
              onClick={onComplete}
              aria-label="Continue"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <audio ref={correctSoundRef} src={CORRECT_SOUND_SRC} preload="auto" />
      <audio ref={wrongSoundRef} src={WRONG_SOUND_SRC} preload="auto" />
      <audio ref={coinSoundRef} src={COIN_SOUND_SRC} preload="auto" />
    </div>
  )
}
