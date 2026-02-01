import type { EditMode } from '../../types'
import { POPULAR_SPORTS, POPULAR_RESIDENTIAL } from '../../constants'

interface TagFormProps {
  editMode: EditMode
  selectedSports: string[]
  customSport: string
  selectedResidential: string[]
  customResidential: string
  onSportToggle: (sport: string) => void
  onResidentialToggle: (value: string) => void
  onCustomSportChange: (value: string) => void
  onCustomResidentialChange: (value: string) => void
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
  onSportToggle,
  onResidentialToggle,
  onCustomSportChange,
  onCustomResidentialChange,
  onConfirm,
  onSkip,
  onFinish,
  isSubmitting,
}) => (
  <div className="sport-form">
    {editMode === 'pitch' ? (
      <>
        <h3>Выберите значение тега sport</h3>
        <div className="sport-checkboxes">
          {POPULAR_SPORTS.map((sport) => (
            <label key={sport} className="sport-checkbox">
              <input
                type="checkbox"
                checked={selectedSports.includes(sport)}
                onChange={() => onSportToggle(sport)}
              />
              <span>{sport}</span>
            </label>
          ))}
        </div>
        <div className="custom-sport-input">
          <label>
            Или введите свое значение:
            <input
              type="text"
              value={customSport}
              onChange={(e) => onCustomSportChange(e.target.value)}
              placeholder="например: football;basketball"
            />
          </label>
        </div>
      </>
    ) : (
      <>
        <h3>Выберите значение тега residential</h3>
        <div className="sport-checkboxes">
          {POPULAR_RESIDENTIAL.map((value) => (
            <label key={value} className="sport-checkbox">
              <input
                type="checkbox"
                checked={selectedResidential.includes(value)}
                onChange={() => onResidentialToggle(value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
        <div className="custom-sport-input">
          <label>
            Или введите свое значение:
            <input
              type="text"
              value={customResidential}
              onChange={(e) => onCustomResidentialChange(e.target.value)}
              placeholder="например: apartments"
            />
          </label>
        </div>
      </>
    )}
    <div className="form-buttons">
      <button onClick={onConfirm} disabled={isSubmitting} className="confirm-button">
        Подтвердить и продолжить
      </button>
      <button onClick={onSkip} disabled={isSubmitting} className="skip-button">
        Пропустить
      </button>
      <button onClick={onFinish} disabled={isSubmitting} className="finish-button">
        Завершить
      </button>
    </div>
  </div>
)
