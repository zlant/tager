import { useTranslation } from 'react-i18next'
import type { OSMObject } from '../../types'

interface EditHeaderProps {
  currentIndex: number
  totalCount: number
  object: OSMObject
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

export const EditHeader: React.FC<EditHeaderProps> = ({
  currentIndex,
  totalCount,
  object,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}) => {
  const { t } = useTranslation()
  return (
    <div className="edit-header">
      <h2>{t('edit.title')}</h2>
      <div className="edit-nav">
        <button
          type="button"
          className="edit-nav-btn"
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label={t('edit.prevAria')}
        >
          {t('edit.prev')}
        </button>
        <span className="edit-nav-counter">
          {currentIndex + 1} / {totalCount}
        </span>
        <button
          type="button"
          className="edit-nav-btn"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label={t('edit.nextAria')}
        >
          {t('edit.next')}
        </button>
      </div>
      <div className="edit-info">
        <span className="edit-object-type">{object.json.type}</span>
        {object.json.timestamp && (
          <span className="edit-timestamp" title={object.json.timestamp}>
            {t('edit.changed')}: {new Date(object.json.timestamp).toLocaleString()}
          </span>
        )}
        <a
          href={`https://www.openstreetmap.org/${object.json.type}/${object.json.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="osm-link"
        >
          {t('edit.openOsm')}
        </a>
      </div>
    </div>
  )
}
