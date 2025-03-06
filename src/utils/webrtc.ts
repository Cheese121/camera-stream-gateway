
import { Camera, CameraStatus } from '@/context/CameraContext';
import { updateCameraStatus } from './api';

// Interval for reconnection attempts in milliseconds
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 3;

interface WebRTCConnection {
  id: string;
  status: CameraStatus;
  pc?: RTCPeerConnection;
  reconnectAttempts: number;
  reconnectTimer?: NodeJS.Timeout;
}

// Store active connections
const connections: Record<string, WebRTCConnection> = {};

// Initialize ICE servers (STUN/TURN)
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

// Simulate WebRTC connection (in a real app, this would connect to a WebRTC server)
export const connectToStream = async (
  camera: Camera,
  videoElement: HTMLVideoElement,
  onStatusChange: (status: CameraStatus) => void
): Promise<void> => {
  // Check if already connected
  if (connections[camera.id]) {
    console.log(`Already connected to camera ${camera.id}`);
    return;
  }
  
  try {
    // In a real app, this would connect to a WebRTC gateway like Janus
    // For demo purposes, we'll simulate the connection with a video stream
    
    // Create new connection
    connections[camera.id] = {
      id: camera.id,
      status: 'connecting',
      reconnectAttempts: 0
    };
    
    // Update status
    onStatusChange('connecting');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 80% success rate for connections
    if (Math.random() > 0.2) {
      // Create a mock stream
      const mockStream = await createMockStream();
      
      videoElement.srcObject = mockStream;
      videoElement.play().catch(error => console.error('Error playing video:', error));
      
      // Update status
      connections[camera.id].status = 'online';
      onStatusChange('online');
      await updateCameraStatus(camera.id, 'online');
      
      console.log(`Connected to camera ${camera.id}`);
    } else {
      throw new Error('Failed to connect to stream');
    }
    
  } catch (error) {
    console.error(`Failed to connect to camera ${camera.id}:`, error);
    
    connections[camera.id] = {
      ...connections[camera.id],
      status: 'offline'
    };
    
    onStatusChange('offline');
    await updateCameraStatus(camera.id, 'offline');
    
    // Start reconnection attempts
    startReconnect(camera, videoElement, onStatusChange);
  }
};

// Create a mock video stream for simulation
const createMockStream = async (): Promise<MediaStream> => {
  // In a real app, this would be the WebRTC stream
  // For demo, we'll create a canvas-based mock stream
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Create animation for the mock stream
  const draw = () => {
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw time
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    const time = new Date().toLocaleTimeString();
    ctx.fillText(time, 20, 40);
    
    // Draw random movement (simulating activity)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    requestAnimationFrame(draw);
  };
  
  draw();
  
  // @ts-ignore - TypeScript doesn't recognize captureStream
  const stream = canvas.captureStream(30);
  return stream;
};

// Disconnect from stream
export const disconnectFromStream = (cameraId: string): void => {
  const connection = connections[cameraId];
  
  if (!connection) {
    return;
  }
  
  // Clear reconnect timer if exists
  if (connection.reconnectTimer) {
    clearTimeout(connection.reconnectTimer);
  }
  
  // Close peer connection if exists
  if (connection.pc) {
    connection.pc.close();
  }
  
  // Remove connection
  delete connections[cameraId];
  
  console.log(`Disconnected from camera ${cameraId}`);
};

// Attempt to reconnect to a stream
const startReconnect = (
  camera: Camera,
  videoElement: HTMLVideoElement,
  onStatusChange: (status: CameraStatus) => void
): void => {
  const connection = connections[camera.id];
  
  if (!connection) {
    return;
  }
  
  // Clear existing timer
  if (connection.reconnectTimer) {
    clearTimeout(connection.reconnectTimer);
  }
  
  if (connection.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log(`Max reconnect attempts reached for camera ${camera.id}`);
    return;
  }
  
  // Increment attempts
  connection.reconnectAttempts += 1;
  
  // Schedule reconnect
  connection.reconnectTimer = setTimeout(async () => {
    console.log(`Attempting to reconnect to camera ${camera.id} (Attempt ${connection.reconnectAttempts})`);
    
    try {
      // Update status
      connection.status = 'connecting';
      onStatusChange('connecting');
      await updateCameraStatus(camera.id, 'connecting');
      
      // Try to connect
      await connectToStream(camera, videoElement, onStatusChange);
      
    } catch (error) {
      console.error(`Reconnect failed for camera ${camera.id}:`, error);
      
      // Update status
      connection.status = 'offline';
      onStatusChange('offline');
      await updateCameraStatus(camera.id, 'offline');
      
      // Try again
      startReconnect(camera, videoElement, onStatusChange);
    }
  }, RECONNECT_INTERVAL);
};

export default {
  connectToStream,
  disconnectFromStream
};
