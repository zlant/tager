import { useTranslation } from 'react-i18next'
import type { EditMode } from '../../types'
import { POPULAR_SPORTS, POPULAR_RESIDENTIAL, POPULAR_ROOF_SHAPES } from '../../constants'

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
            {POPULAR_SPORTS.map((sport) => (
              <label key={sport} className="sport-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSports.includes(sport)}
                  onChange={() => onSportToggle(sport)}
                />
                <span className="tag-label">
                  {t(`sport.${sport}`)}
                  <small>{sport}</small>
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
            {POPULAR_RESIDENTIAL.map((value) => (
              <label key={value} className="sport-checkbox">
                <input
                  type="radio"
                  name="residential"
                  value={value}
                  checked={selectedResidential === value}
                  onChange={() => onResidentialSelect(value)}
                />
                <span className="tag-label">
                  {t(`residential.${value}`)}
                  <small>{value}</small>
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
            {POPULAR_ROOF_SHAPES.map((value) => (
              <label key={value} className="sport-checkbox">
                <input
                  type="radio"
                  name="roofShape"
                  value={value}
                  checked={selectedRoofShape === value}
                  onChange={() => onRoofShapeSelect(value)}
                />
                <span className="tag-label">
                  {t(`roofShape.${value}`)}
                  <small>{value}</small>
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
