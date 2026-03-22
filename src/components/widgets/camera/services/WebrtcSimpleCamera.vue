<template>
  <video
    ref="streamingElement"
    autoplay
    disablePictureInPicture
    playsinline
    muted
    :style="cameraStyle"
    :crossorigin="crossorigin"
    @play="updateStatus('connected')"
    @error="handleError"
  />
</template>

<script lang="ts">
import { Component, Ref, Mixins } from 'vue-property-decorator'
import { consola } from 'consola'
import CameraMixin from '@/mixins/camera'

@Component({})
export default class WebrtcSimpleCamera extends Mixins(CameraMixin) {
  @Ref('streamingElement')
  readonly cameraVideo!: HTMLVideoElement

  pc: RTCPeerConnection | null = null

  handleError () {
    this.updateStatus('error')
  }

  async startPlayback () {
    try {
      this.updateStatus('connecting')

      const url = this.buildAbsoluteUrl(this.camera.stream_url || '')
      this.updateRawCameraUrl(url.toString())

      // Create peer connection with STUN server
      const pc = this.pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      // Handle incoming video track
      pc.ontrack = (event: RTCTrackEvent) => {
        consola.log('[WebrtcSimpleCamera] received video track')
        this.cameraVideo.srcObject = event.streams[0]
      }

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        consola.log('[WebrtcSimpleCamera] ICE connection state:', pc.iceConnectionState)

        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          this.updateStatus('connected')
        } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          this.updateStatus('error')
        }
      }

      // Wait for ICE gathering to complete, then send offer
      pc.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate === null) {
          // ICE gathering complete, send offer to server
          await this.sendOfferToServer(url, pc.localDescription!.sdp)
        }
      }

      // Add video transceiver
      pc.addTransceiver('video', { direction: 'sendrecv' })

      // Create and set local offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

    } catch (e) {
      consola.error(`[WebrtcSimpleCamera] failed to start playback "${this.camera.name}"`, e)
      this.updateStatus('error')
    }
  }

  async sendOfferToServer (url: URL, sdp: string) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        credentials: 'include',
        body: btoa(JSON.stringify({ type: 'offer', sdp }))
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      // Decode the base64 response
      const responseText = await response.text()
      const answer = JSON.parse(atob(responseText)) as RTCSessionDescriptionInit

      consola.log('[WebrtcSimpleCamera] received answer:', answer)

      if (answer.type === 'answer' && this.pc) {
        // Set remote description with the answer from server
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    } catch (e) {
      consola.error('[WebrtcSimpleCamera] failed to send offer:', e)
      this.updateStatus('error')
    }
  }

  stopPlayback () {
    this.updateStatus('disconnected')
    this.pc?.close()
    this.pc = null
    this.cameraVideo.src = ''
    this.cameraVideo.srcObject = null
  }
}
</script>
