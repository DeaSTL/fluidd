import type { Module } from 'vuex'
import { state } from './state'
import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import type { CustomCamerasState } from './types'
import type { RootState } from '../types'

export const customCameras: Module<CustomCamerasState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
