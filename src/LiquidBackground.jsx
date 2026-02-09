/**
 * Full-page liquid/ether-style background.
 * Replace with @react-bits/LiquidEther-JS-CSS when the registry install works:
 *   pnpm dlx shadcn@latest add @react-bits/LiquidEther-JS-CSS
 */
export function LiquidBackground() {
  return (
    <div className="liquid-bg" aria-hidden>
      <div className="liquid-bg__blob liquid-bg__blob-1" />
      <div className="liquid-bg__blob liquid-bg__blob-2" />
      <div className="liquid-bg__blob liquid-bg__blob-3" />
      <div className="liquid-bg__blob liquid-bg__blob-4" />
    </div>
  )
}
