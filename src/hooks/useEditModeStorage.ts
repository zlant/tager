import { useState, useCallback } from 'react'
import type { EditMode } from '../types'
import { loadSavedEditMode, saveEditMode as saveEditModeStorage } from '../utils/storage'

export function useEditModeStorage() {
  const [editMode, setEditModeState] = useState<EditMode>(loadSavedEditMode)
  const setEditMode = useCallback((mode: EditMode) => {
    setEditModeState(mode)
    saveEditModeStorage(mode)
  }, [])
  return { editMode, setEditMode }
}
