import { useState, useCallback } from 'react'
import { TrackListing } from './TrackListing.jsx'

const REQUIRED_CLICKS = 14
const VINYL_COVER_SRC = '/vinylcover.jpeg'

export function EarnedPresent({ onShowTrackListing }) {
  const [clicks, setClicks] = useState(0)
  const [opened, setOpened] = useState(false)
  const [showTrackListing, setShowTrackListing] = useState(false)

  const handlePresentClick = useCallback(() => {
    if (opened) return
    setClicks((c) => {
      const next = c + 1
      if (next >= REQUIRED_CLICKS) setOpened(true)
      return next
    })
  }, [opened])

  if (showTrackListing) {
    return <TrackListing />
  }

  return (
    <div className="earned-present">
      <h2 className="earned-present__title">You have earned your present</h2>
      {!opened ? (
        <>
          <button
            type="button"
            className="earned-present__box"
            onClick={handlePresentClick}
            aria-label="Open present"
          >
            <span className="earned-present__box-emoji">{'\u{1F381}'}</span>
          </button>
          <p className="earned-present__hint">{clicks}/{REQUIRED_CLICKS}</p>
        </>
      ) : (
        <>
          <div className="earned-present__reveal">
            <img src={VINYL_COVER_SRC} alt="Your vinyl" className="earned-present__cover" />
          </div>
          <button
            type="button"
            className="earned-present__track-btn"
            onClick={() => {
              onShowTrackListing?.()
              setShowTrackListing(true)
            }}
          >
            Let&apos;s see the Track Listing
          </button>
        </>
      )}
    </div>
  )
}
