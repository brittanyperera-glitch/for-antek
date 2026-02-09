import { useState } from 'react'

/**
 * Gift box graphic: lid opens to reveal content (e.g. heart / vinyl hint).
 */
export function GiftBox({ onReveal }) {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    if (open) return
    setOpen(true)
    onReveal?.()
  }

  return (
    <div className="gift-box" role="button" tabIndex={0} onClick={handleOpen} onKeyDown={(e) => e.key === 'Enter' && handleOpen()} aria-label="Open gift">
      <div className="gift-box__wrapper">
        {/* Box base */}
        <svg className="gift-box__svg gift-box__base" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 45 L60 45 L60 95 L10 95 Z" fill="url(#box-base)" stroke="#8b5a2b" strokeWidth="1.5" />
          <path d="M60 45 L110 45 L110 95 L60 95 Z" fill="url(#box-base)" stroke="#8b5a2b" strokeWidth="1.5" />
          <path d="M10 45 L60 45 L60 95 L10 95 Z" fill="url(#box-shade)" stroke="transparent" />
          <defs>
            <linearGradient id="box-base" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4956a" />
              <stop offset="100%" stopColor="#8b5a2b" />
            </linearGradient>
            <linearGradient id="box-shade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        {/* Lid */}
        <div className={`gift-box__lid ${open ? 'gift-box__lid--open' : ''}`}>
          <svg className="gift-box__svg" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 5 L60 5 L60 45 L10 45 Z" fill="url(#lid-fill)" stroke="#6b4423" strokeWidth="1.5" />
            <path d="M60 5 L110 5 L110 45 L60 45 Z" fill="url(#lid-fill)" stroke="#6b4423" strokeWidth="1.5" />
            <path d="M55 0 L65 0 L65 50 L55 50 Z" fill="url(#ribbon)" stroke="#a62a2a" strokeWidth="1" />
            <path d="M0 25 L120 25" stroke="#a62a2a" strokeWidth="6" strokeLinecap="round" />
            <defs>
              <linearGradient id="lid-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4a574" />
                <stop offset="100%" stopColor="#9c6b3d" />
              </linearGradient>
              <linearGradient id="ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c53030" />
                <stop offset="50%" stopColor="#e53e3e" />
                <stop offset="100%" stopColor="#c53030" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Reveal content inside */}
        <div className={`gift-box__reveal ${open ? 'gift-box__reveal--visible' : ''}`}>
          <div className="gift-box__inner">
            <svg className="gift-box__heart" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="gift-box__label">Your vinyl</span>
          </div>
        </div>
      </div>
      {!open && <p className="gift-box__hint">Click to open</p>}
    </div>
  )
}
