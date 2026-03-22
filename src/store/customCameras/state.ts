import type { CustomCamerasState } from './types'

const STORAGE_KEY = 'fluidd.customCameras'

const loadFromLocalStorage = (): CustomCamerasState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as CustomCamerasState
    }
  } catch (e) {
    console.error('Failed to load custom cameras from localStorage', e)
  }
  return { cameras: [] }
}

export const defaultState = (): CustomCamerasState => {
  return loadFromLocalStorage()
}

export const state = defaultState()
