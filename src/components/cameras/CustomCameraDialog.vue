<template>
  <app-dialog
    v-model="open"
    :title="camera ? $t('app.general.title.edit_camera') : $t('app.general.title.add_camera')"
    :save-button-text="camera ? $t('app.general.btn.save') : $t('app.general.btn.add')"
    max-width="600"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
        <v-text-field
          v-model="form.name"
          :label="$t('app.general.label.name')"
          :rules="[rules.required]"
          outlined
          dense
        />

        <v-select
          v-model="form.type"
          :label="$t('app.general.label.camera_type')"
          :items="cameraTypes"
          :rules="[rules.required]"
          outlined
          dense
        />

        <v-text-field
          v-model="form.urlStream"
          :label="$t('app.general.label.stream_url')"
          :rules="[rules.required, rules.url]"
          placeholder="http://192.168.1.100:8000/stream"
          outlined
          dense
        />

        <v-text-field
          v-model="form.printerAssociation"
          :label="$t('app.general.label.printer_association')"
          :hint="$t('app.general.label.printer_association_hint')"
          placeholder="k1c-yoda"
          outlined
          dense
          clearable
        />

        <v-row>
          <v-col cols="6">
            <v-checkbox
              v-model="form.flipX"
              :label="$t('app.general.label.flip_horizontal')"
              dense
            />
          </v-col>
          <v-col cols="6">
            <v-checkbox
              v-model="form.flipY"
              :label="$t('app.general.label.flip_vertical')"
              dense
            />
          </v-col>
        </v-row>

        <v-select
          v-model="form.rotation"
          :label="$t('app.general.label.rotation')"
          :items="rotationOptions"
          outlined
          dense
        />

        <v-checkbox
          v-model="form.enabled"
          :label="$t('app.general.label.enabled')"
          dense
        />
    </v-card-text>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import type { CustomCamera } from '@/store/customCameras/types'
import { v4 as uuidv4 } from 'uuid'

@Component({})
export default class CustomCameraDialog extends Vue {
  @Prop({ type: Object, default: null })
  readonly camera!: CustomCamera | null

  open = true
  valid = false

  form: CustomCamera = {
    id: '',
    name: '',
    type: 'mjpegstreamer',
    urlStream: '',
    printerAssociation: '',
    enabled: true,
    flipX: false,
    flipY: false,
    rotation: '0'
  }

  rules = {
    required: (v: string) => !!v || this.$t('app.general.simple_form.error.required'),
    url: (v: string) => {
      if (!v) return true
      try {
        new URL(v)
        return true
      } catch {
        return this.$t('app.general.simple_form.error.invalid_url')
      }
    }
  }

  get cameraTypes () {
    return [
      { text: 'MJPEG Streamer', value: 'mjpegstreamer' },
      { text: 'MJPEG Streamer (Adaptive)', value: 'mjpegstreamer-adaptive' },
      { text: 'IP Camera / Generic MJPEG', value: 'ipstream' },
      { text: 'HLS Stream', value: 'hlsstream' },
      { text: 'IFrame', value: 'iframe' },
      { text: 'WebRTC (camera-streamer)', value: 'webrtc-camerastreamer' },
      { text: 'WebRTC (MediaMTX)', value: 'webrtc-mediamtx' },
      { text: 'WebRTC (go2rtc)', value: 'webrtc-go2rtc' },
      { text: 'WebRTC (Simple/Generic)', value: 'webrtc-simple' }
    ]
  }

  get rotationOptions () {
    return [
      { text: '0°', value: '0' },
      { text: '90°', value: '90' },
      { text: '180°', value: '180' },
      { text: '270°', value: '270' }
    ]
  }

  mounted () {
    if (this.camera) {
      this.form = { ...this.camera }
    } else {
      this.form.id = uuidv4()
    }
  }

  handleSave () {
    // Validate required fields
    if (!this.form.name || !this.form.urlStream) {
      return
    }

    // Validate URL
    try {
      new URL(this.form.urlStream)
    } catch {
      return
    }

    this.$emit('save', this.form)
    this.open = false
  }
}
</script>
