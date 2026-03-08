import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EditMode } from '../../types'
import { OPTIONS_BY_MODE } from '../../constants'
import { OptionIconWithTooltip } from './OptionIconWithTooltip'

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

interface OptionRowProps {
  inputType: 'checkbox' | 'radio'
  name?: string
  checked: boolean
  onChange: () => void
  labelText: string
  value: string
  icon?: string
}

const OptionRow: React.FC<OptionRowProps> = ({
  inputType,
  name,
  checked,
  onChange,
  labelText,
  value,
  icon,
}) => {
  const labelRef = useRef<HTMLLabelElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <label
      ref={labelRef}
      className="sport-checkbox"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <input
        type={inputType}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {icon && <OptionIconWithTooltip src={icon} anchorRef={labelRef} open={open} />}
      <span className="tag-label">
        {labelText}
        <small>{value}</small>
      </span>
    </label>
  )
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
              <OptionRow
                key={opt.value}
                inputType="checkbox"
                checked={selectedSports.includes(opt.value)}
                onChange={() => onSportToggle(opt.value)}
                labelText={t(`sport.${opt.value}`)}
                value={opt.value}
                icon={opt.icon}
              />
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
              <OptionRow
                key={opt.value}
                inputType="radio"
                name="residential"
                checked={selectedResidential === opt.value}
                onChange={() => onResidentialSelect(opt.value)}
                labelText={t(`residential.${opt.value}`)}
                value={opt.value}
                icon={opt.icon}
              />
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
              <OptionRow
                key={opt.value}
                inputType="radio"
                name="roofShape"
                checked={selectedRoofShape === opt.value}
                onChange={() => onRoofShapeSelect(opt.value)}
                labelText={t(`roofShape.${opt.value}`)}
                value={opt.value}
                icon={opt.icon}
              />
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
