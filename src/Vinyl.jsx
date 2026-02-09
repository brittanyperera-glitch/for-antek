export function Vinyl({ isSpinning = true }) {
  return (
    <div className={`vinyl ${isSpinning ? 'vinyl--spinning' : ''}`}>
      <div className="vinyl__disc" />
      <div className="vinyl__label" />
    </div>
  )
}
