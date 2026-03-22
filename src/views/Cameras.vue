<template>
  <div>
    <v-toolbar dense flat>
      <v-toolbar-title>
        {{ $t('app.general.title.cameras') }}
      </v-toolbar-title>
      <v-spacer />
      <app-btn
        color="primary"
        @click="showAddDialog = true"
      >
        <v-icon left>
          $plus
        </v-icon>
        {{ $t('app.general.btn.add_camera') }}
      </app-btn>
    </v-toolbar>

    <v-container fluid>
      <v-row
        v-if="cameras.length === 0"
        justify="center"
      >
        <v-col
          cols="12"
          md="6"
          class="text-center"
        >
          <v-icon
            size="64"
            color="grey"
          >
            $camera
          </v-icon>
          <p class="text-h6 grey--text mt-4">
            {{ $t('app.general.simple_form.msg.no_cameras') }}
          </p>
          <app-btn
            color="primary"
            @click="showAddDialog = true"
          >
            {{ $t('app.general.btn.add_first_camera') }}
          </app-btn>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col
          v-for="camera in cameras"
          :key="camera.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card>
            <v-card-title class="text-subtitle-1">
              {{ camera.name }}
              <v-spacer />
              <v-menu offset-y>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>$dots</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="editCamera(camera)">
                    <v-list-item-icon>
                      <v-icon>$pencil</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ $t('app.general.btn.edit') }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item @click="toggleCamera(camera.id)">
                    <v-list-item-icon>
                      <v-icon>{{ camera.enabled ? '$eye-off' : '$eye' }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ camera.enabled ? $t('app.general.btn.disable') : $t('app.general.btn.enable') }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item @click="deleteCamera(camera.id)">
                    <v-list-item-icon>
                      <v-icon color="error">
                        $delete
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="error--text">
                        {{ $t('app.general.btn.delete') }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-title>
            <v-card-subtitle v-if="camera.printerAssociation">
              <v-chip small>
                <v-icon left small>
                  $printer3d
                </v-icon>
                {{ camera.printerAssociation }}
              </v-chip>
            </v-card-subtitle>
            <v-card-text class="pa-0">
              <div
                v-if="camera.enabled"
                class="camera-container"
              >
                <component
                  :is="getCameraComponent(camera.type)"
                  :camera="formatCameraForComponent(camera)"
                />
                <v-btn
                  icon
                  small
                  class="fullscreen-btn"
                  @click="openFullscreen(camera)"
                >
                  <v-icon small>
                    mdi-arrow-expand
                  </v-icon>
                </v-btn>
              </div>
              <div
                v-else
                class="camera-disabled text-center pa-4"
              >
                <v-icon size="48" color="grey">
                  $cameraOff
                </v-icon>
                <p class="grey--text mt-2">
                  {{ $t('app.general.simple_form.msg.camera_disabled') }}
                </p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <custom-camera-dialog
      v-if="showAddDialog || editingCamera"
      :camera="editingCamera"
      @save="handleSave"
      @close="handleClose"
    />

    <v-dialog
      v-model="showFullscreen"
      max-width="90vw"
      @click:outside="closeFullscreen"
    >
      <v-card v-if="fullscreenCamera">
        <v-card-title>
          {{ fullscreenCamera.name }}
          <v-spacer />
          <v-btn
            icon
            @click="closeFullscreen"
          >
            <v-icon>$close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <div class="fullscreen-camera-container">
            <component
              :is="getCameraComponent(fullscreenCamera.type)"
              :camera="formatCameraForComponent(fullscreenCamera)"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import type { CustomCamera } from '@/store/customCameras/types'
import CustomCameraDialog from '@/components/cameras/CustomCameraDialog.vue'

@Component({
  components: {
    CustomCameraDialog,
    MjpegstreamerCamera: () => import('@/components/widgets/camera/services/MjpegstreamerCamera.vue'),
    MjpegstreamerAdaptiveCamera: () => import('@/components/widgets/camera/services/MjpegstreamerAdaptiveCamera.vue'),
    IpstreamCamera: () => import('@/components/widgets/camera/services/IpstreamCamera.vue'),
    IframeCamera: () => import('@/components/widgets/camera/services/IframeCamera.vue'),
    HlsstreamCamera: () => import('@/components/widgets/camera/services/HlsstreamCamera.vue'),
    WebrtcCamerastreamerCamera: () => import('@/components/widgets/camera/services/WebrtcCamerastreamerCamera.vue'),
    WebrtcMediamtxCamera: () => import('@/components/widgets/camera/services/WebrtcMediamtxCamera.vue'),
    WebrtcGo2RtcCamera: () => import('@/components/widgets/camera/services/WebrtcGo2RtcCamera.vue'),
    WebrtcSimpleCamera: () => import('@/components/widgets/camera/services/WebrtcSimpleCamera.vue')
  }
})
export default class Cameras extends Vue {
  showAddDialog = false
  editingCamera: CustomCamera | null = null
  showFullscreen = false
  fullscreenCamera: CustomCamera | null = null

  get cameras (): CustomCamera[] {
    return this.$store.getters['customCameras/getAllCameras']()
  }

  getCameraComponent (type: string) {
    const typeMap: Record<string, string> = {
      'mjpegstreamer': 'MjpegstreamerCamera',
      'mjpegstreamer-adaptive': 'MjpegstreamerAdaptiveCamera',
      'ipstream': 'IpstreamCamera',
      'iframe': 'IframeCamera',
      'hlsstream': 'HlsstreamCamera',
      'webrtc-camerastreamer': 'WebrtcCamerastreamerCamera',
      'webrtc-mediamtx': 'WebrtcMediamtxCamera',
      'webrtc-go2rtc': 'WebrtcGo2RtcCamera',
      'webrtc-simple': 'WebrtcSimpleCamera'
    }
    return typeMap[type] || 'IframeCamera'
  }

  formatCameraForComponent (camera: CustomCamera) {
    // Convert CustomCamera to format expected by camera components
    return {
      uid: camera.id,
      name: camera.name,
      enabled: camera.enabled,
      service: camera.type,
      stream_url: camera.urlStream,
      url_stream: camera.urlStream,
      urlStream: camera.urlStream,
      flip_x: camera.flipX || false,
      flip_y: camera.flipY || false,
      flipX: camera.flipX || false,
      flipY: camera.flipY || false,
      rotation: camera.rotation || 0,
      aspect_ratio: '16:9',
      aspectRatio: '16:9'
    }
  }

  editCamera (camera: CustomCamera) {
    this.editingCamera = { ...camera }
  }

  async deleteCamera (id: string) {
    const result = await this.$confirm(
      this.$t('app.general.simple_form.msg.confirm_camera_delete').toString(),
      { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
    if (result) {
      this.$store.dispatch('customCameras/deleteCamera', id)
    }
  }

  toggleCamera (id: string) {
    this.$store.dispatch('customCameras/toggleCamera', id)
  }

  handleSave (camera: CustomCamera) {
    this.$store.dispatch('customCameras/addOrUpdateCamera', camera)
    this.handleClose()
  }

  handleClose () {
    this.showAddDialog = false
    this.editingCamera = null
  }

  openFullscreen (camera: CustomCamera) {
    this.fullscreenCamera = camera
    this.showFullscreen = true
  }

  closeFullscreen () {
    this.showFullscreen = false
    this.fullscreenCamera = null
  }
}
</script>

<style scoped>
.camera-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #000;
}

.camera-container > :not(.fullscreen-btn) {
  width: 100% !important;
  height: 100% !important;
  display: block;
  object-fit: cover;
  transform: none !important;
}

.fullscreen-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6) !important;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.fullscreen-btn .v-icon {
  color: white !important;
}

.camera-container:hover .fullscreen-btn {
  opacity: 1;
}

.fullscreen-camera-container {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #000;
}

.fullscreen-camera-container > * {
  width: 100% !important;
  height: 100% !important;
  display: block;
  object-fit: cover;
  transform: none !important;
}

.camera-disabled {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
