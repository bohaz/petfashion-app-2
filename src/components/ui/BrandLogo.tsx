import Image from 'next/image'

// Brand logo from the Pet Fashion brand manual (v1.1, 2026).
// The name is a drawing: never rebuild it with a font, always use the file.
// The compact version is for widths of 120 px or more.

const COMPACT = { src: '/brand/logo-compacto.svg', width: 229, height: 44 }

interface BrandLogoProps {
  /** Rendered height in pixels; the width keeps the logo's proportions. */
  height?: number
  priority?: boolean
  className?: string
}

export function BrandLogo({ height = 32, priority = false, className }: BrandLogoProps) {
  const width = Math.round((COMPACT.width / COMPACT.height) * height)
  return (
    <Image
      src={COMPACT.src}
      alt="Pet Fashion"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={className}
    />
  )
}
