function SectionHeading({ title, subtitle, className = '' }) {
  return (
    <div className={`mx-auto mb-16 max-w-2xl text-center md:mb-20 ${className}`}>
      <h2 className="mb-4 text-3xl font-bold text-text-charcoal md:text-4xl">{title}</h2>
      {subtitle ? <p className="text-gray-600">{subtitle}</p> : null}
    </div>
  )
}

export default SectionHeading