import type { MutationTree } from 'vuex'
import type { CustomCamerasState, CustomCamera } from './types'
import { v4 as uuidv4 } from 'uuid'

export const mutations: MutationTree<CustomCamerasState> = {
  setCamera (state, camera: CustomCamera) {
    const index = state.cameras.findIndex(c => c.id === camera.id)
    if (index >= 0) {
      state.cameras.splice(index, 1, camera)
    } else {
      state.cameras.push({ ...camera, id: camera.id || uuidv4() })
    }
  },

  removeCamera (state, id: string) {
    const index = state.cameras.findIndex(c => c.id === id)
    if (index >= 0) {
      state.cameras.splice(index, 1)
    }
  },

  toggleCamera (state, id: string) {
    const camera = state.cameras.find(c => c.id === id)
    if (camera) {
      camera.enabled = !camera.enabled
    }
  },

  setCameras (state, cameras: CustomCamera[]) {
    state.cameras = cameras
  }
}
