export interface CustomCamerasState {
  cameras: CustomCamera[];
}

export interface CustomCamera {
  id: string;
  name: string;
  type: CustomCameraType;
  urlStream: string;
  printerAssociation?: string; // Optional printer ID/name
  enabled: boolean;
  flipX?: boolean;
  flipY?: boolean;
  rotation?: '0' | '90' | '180' | '270';
}

export type CustomCameraType = 'mjpegstreamer' | 'mjpegstreamer-adaptive' | 'ipstream' | 'iframe' | 'hlsstream' | 'webrtc-camerastreamer' | 'webrtc-mediamtx' | 'webrtc-go2rtc' | 'webrtc-simple'
