import { useTranslation } from 'react-i18next'
import type { EditMode } from '../../types'
import { OPTIONS_BY_MODE } from '../../constants'

interface TagFormProps {
  editMode: EditMode
  selectedSports: string[]
  customSport: string
  selectedResidential: string
  customResidential: string
  selectedRoofShape: string
  customRoofShape: string
  onSportToggle: (sport: string) => void
  onResidentialSelect: (value: string) => void
  onRoofShapeSelect: (value: string) => void
  onCustomSportChange: (value: string) => void
  onCustomResidentialChange: (value: string) => void
  onCustomRoofShapeChange: (value: string) => void
  onConfirm: () => void
  onSkip: () => void
  onFinish: () => void
  isSubmitting: boolean
}

export const TagForm: React.FC<TagFormProps> = ({
  editMode,
  selectedSports,
  customSport,
  selectedResidential,
  customResidential,
  selectedRoofShape,
  customRoofShape,
  onSportToggle,
  onResidentialSelect,
  onRoofShapeSelect,
  onCustomSportChange,
  onCustomResidentialChange,
  onCustomRoofShapeChange,
  onConfirm,
  onSkip,
  onFinish,
  isSubmitting,
}) => {
  const { t } = useTranslation()
  return (
    <div className="sport-form">
      {editMode === 'pitch' ? (
        <>
          <h3>{t('form.sportTitle')}</h3>
          <div className="sport-checkboxes">
            {OPTIONS_BY_MODE.pitch.map((opt) => (
              <label key={opt.value} className="sport-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSports.includes(opt.value)}
                  onChange={() => onSportToggle(opt.value)}
                />
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt=""
                    className="option-icon"
                    width={48}
                    height={32}
                    loading="lazy"
                  />
                )}
                <span className="tag-label">
                  {t(`sport.${opt.value}`)}
                  <small>{opt.value}</small>
                </span>
              </label>
            ))}
          </div>
          <div className="custom-sport-input">
            <label>
              {t('form.customLabel')}
              <input
                type="text"
                value={customSport}
                onChange={(e) => onCustomSportChange(e.target.value)}
                placeholder={t('form.sportPlaceholder')}
              />
            </label>
          </div>
        </>
      ) : editMode === 'residential' ? (
        <>
          <h3>{t('form.residentialTitle')}</h3>
          <div className="sport-checkboxes">
            {OPTIONS_BY_MODE.residential.map((opt) => (
              <label key={opt.value} className="sport-checkbox">
                <input
                  type="radio"
                  name="residential"
                  value={opt.value}
                  checked={selectedResidential === opt.value}
                  onChange={() => onResidentialSelect(opt.value)}
                />
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt=""
                    className="option-icon"
                    width={48}
                    height={32}
                    loading="lazy"
                  />
                )}
                <span className="tag-label">
                  {t(`residential.${opt.value}`)}
                  <small>{opt.value}</small>
                </span>
              </label>
            ))}
          </div>
          <div className="custom-sport-input">
            <label>
              {t('form.customLabel')}
              <input
                type="text"
                value={customResidential}
                onChange={(e) => onCustomResidentialChange(e.target.value)}
                placeholder={t('form.residentialPlaceholder')}
              />
            </label>
          </div>
        </>
      ) : (
        <>
          <h3>{t('form.roofShapeTitle')}</h3>
          <div className="sport-checkboxes">
            {OPTIONS_BY_MODE.roof_shape_apartments.map((opt) => (
              <label key={opt.value} className="sport-checkbox">
                <input
                  type="radio"
                  name="roofShape"
                  value={opt.value}
                  checked={selectedRoofShape === opt.value}
                  onChange={() => onRoofShapeSelect(opt.value)}
                />
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt=""
                    className="option-icon"
                    width={48}
                    height={32}
                    loading="lazy"
                  />
                )}
                <span className="tag-label">
                  {t(`roofShape.${opt.value}`)}
                  <small>{opt.value}</small>
                </span>
              </label>
            ))}
          </div>
          <div className="custom-sport-input">
            <label>
              {t('form.customLabel')}
              <input
                type="text"
                value={customRoofShape}
                onChange={(e) => onCustomRoofShapeChange(e.target.value)}
                placeholder={t('form.roofShapePlaceholder')}
              />
            </label>
          </div>
        </>
      )}
      <div className="form-buttons">
        <button onClick={onConfirm} disabled={isSubmitting} className="confirm-button">
          {t('form.confirm')}
        </button>
        <button onClick={onSkip} disabled={isSubmitting} className="skip-button">
          {t('form.skip')}
        </button>
        <button onClick={onFinish} disabled={isSubmitting} className="finish-button">
          {t('form.finish')}
        </button>
      </div>
    </div>
  )
}
