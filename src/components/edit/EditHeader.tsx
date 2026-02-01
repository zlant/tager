import type { OSMObject } from '../../types'

interface EditHeaderProps {
  currentIndex: number
  totalCount: number
  object: OSMObject
}

export const EditHeader: React.FC<EditHeaderProps> = ({
  currentIndex,
  totalCount,
  object,
}) => (
  <div className="edit-header">
    <h2>Редактирование объектов</h2>
    <div className="edit-info">
      <span>
        Объект {currentIndex + 1} из {totalCount}
      </span>
      <span className="edit-object-type">{object.json.type}</span>
      {object.json.timestamp && (
        <span className="edit-timestamp" title={object.json.timestamp}>
          Изменён: {new Date(object.json.timestamp).toLocaleString()}
        </span>
      )}
      <a
        href={`https://www.openstreetmap.org/${object.json.type}/${object.json.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="osm-link"
      >
        Открыть на osm.org
      </a>
    </div>
  </div>
)
