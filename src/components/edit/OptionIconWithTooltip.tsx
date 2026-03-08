import { useLayoutEffect, useMemo, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'

interface OptionIconWithTooltipProps {
  src: string
  anchorRef: RefObject<HTMLElement>
  open: boolean
}

type TooltipPlacement = 'top' | 'bottom'

export const OptionIconWithTooltip: React.FC<OptionIconWithTooltipProps> = ({ src, anchorRef, open }) => {
  const [style, setStyle] = useState<CSSProperties>({})
  const [placement, setPlacement] = useState<TooltipPlacement>('top')

  useLayoutEffect(() => {
    if (!open) return
    const gap = 8
    const margin = 8

    // Rough tooltip dimensions to clamp into viewport.
    const tooltipW = 164
    const tooltipH = 116

    const update = () => {
      const el = anchorRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const centeredX = rect.left + rect.width / 2
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Prefer above the option; if not enough room, show below.
      const canShowTop = rect.top >= tooltipH + margin + gap
      const nextPlacement: TooltipPlacement = canShowTop ? 'top' : 'bottom'
      setPlacement(nextPlacement)

      const clampedLeft = Math.min(
        vw - margin - tooltipW / 2,
        Math.max(margin + tooltipW / 2, centeredX)
      )
      const top =
        nextPlacement === 'top'
          ? Math.max(margin, rect.top - gap)
          : Math.min(vh - margin, rect.bottom + gap)

      setStyle({
        left: clampedLeft,
        top,
        transform: nextPlacement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
      })
    }

    update()
    window.addEventListener('resize', update)
    // Capture scroll events from scrollable containers too.
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchorRef, open])

  const tooltip = useMemo(() => {
    if (!open) return null
    return createPortal(
      <span className={`option-image-tooltip option-image-tooltip--${placement}`} style={style}>
        <img src={src} alt="" />
      </span>,
      document.body
    )
  }, [open, placement, src, style])

  return (
    <>
      <span className="option-icon-wrapper">
        <img src={src} alt="" className="option-icon" width={48} height={32} loading="lazy" />
      </span>
      {tooltip}
    </>
  )
}
