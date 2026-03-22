import type { GetterTree } from 'vuex'
import type { CustomCamerasState, CustomCamera } from './types'
import type { RootState } from '../types'

export const getters: GetterTree<CustomCamerasState, RootState> = {
  getAllCameras: (state) => (): CustomCamera[] => {
    return state.cameras
  },

  getEnabledCameras: (state) => (): CustomCamera[] => {
    return state.cameras.filter(c => c.enabled)
  },

  getCamerasByPrinter: (state) => (printerName: string): CustomCamera[] => {
    return state.cameras.filter(c => c.enabled && c.printerAssociation === printerName)
  },

  getCameraById: (state) => (id: string): CustomCamera | undefined => {
    return state.cameras.find(c => c.id === id)
  }
}
