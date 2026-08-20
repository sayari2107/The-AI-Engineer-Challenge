export function AccentureLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span className="relative text-2xl font-semibold lowercase tracking-tight text-foreground">
        accenture
        {/* The iconic "greater than" mark sits above the t */}
        <span
          aria-hidden="true"
          className="absolute -top-1 right-[0.05em] text-primary"
          style={{ fontSize: '0.7em', lineHeight: 1 }}
        >
          {'>'}
        </span>
      </span>
    </div>
  )
}
