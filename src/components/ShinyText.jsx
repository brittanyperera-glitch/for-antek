/**
 * ShinyText-style: metallic sheen sweeps across text.
 * Stand-in for @react-bits/ShinyText-JS-CSS when registry install fails.
 */
export function ShinyText({ children, className = '', as: Component = 'span', ...props }) {
  return (
    <Component className={`shiny-text ${className}`.trim()} {...props}>
      <span className="shiny-text__content">{children}</span>
      <span className="shiny-text__shine" aria-hidden />
    </Component>
  )
}
