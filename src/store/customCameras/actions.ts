import type { ActionTree } from 'vuex'
import type { CustomCamerasState, CustomCamera } from './types'
import type { RootState } from '../types'

const STORAGE_KEY = 'fluidd.customCameras'

const saveToLocalStorage = (state: CustomCamerasState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save custom cameras to localStorage', e)
  }
}

export const actions: ActionTree<CustomCamerasState, RootState> = {
  addOrUpdateCamera ({ commit, state }, camera: CustomCamera) {
    commit('setCamera', camera)
    saveToLocalStorage(state)
  },

  deleteCamera ({ commit, state }, id: string) {
    commit('removeCamera', id)
    saveToLocalStorage(state)
  },

  toggleCamera ({ commit, state }, id: string) {
    commit('toggleCamera', id)
    saveToLocalStorage(state)
  }
}
