
import { Camera } from '@/context/CameraContext';
import { v4 as uuidv4 } from 'uuid';

// In a real application, these would call actual API endpoints
// For now, we'll simulate API calls with localStorage

// Mock data
const mockCameras: Camera[] = [
  {
    id: '1',
    name: 'Lobby Camera',
    rtspUrl: 'rtsp://example.com/lobby',
    location: 'Main Entrance',
    status: 'online',
    lastSeen: new Date().toISOString(),
    webrtcUrl: 'wss://localhost:8188/lobby'
  },
  {
    id: '2',
    name: 'Parking Lot',
    rtspUrl: 'rtsp://example.com/parking',
    location: 'North Side',
    status: 'offline',
    lastSeen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    webrtcUrl: 'wss://localhost:8188/parking'
  },
  {
    id: '3',
    name: 'Server Room',
    rtspUrl: 'rtsp://example.com/server-room',
    location: 'Building B',
    status: 'connecting',
    lastSeen: new Date().toISOString(),
    webrtcUrl: 'wss://localhost:8188/server-room'
  }
];

// Initialize localStorage with mock data if not present
const initializeStorage = () => {
  if (!localStorage.getItem('cameras')) {
    localStorage.setItem('cameras', JSON.stringify(mockCameras));
  }
};

// Get cameras from storage
export const fetchCameras = async (): Promise<Camera[]> => {
  initializeStorage();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const storedCameras = localStorage.getItem('cameras');
  return storedCameras ? JSON.parse(storedCameras) : [];
};

// Add a new camera
export const addCamera = async (
  cameraData: Omit<Camera, 'id' | 'status'>
): Promise<Camera> => {
  const storedCameras = localStorage.getItem('cameras');
  const cameras = storedCameras ? JSON.parse(storedCameras) : [];
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newCamera: Camera = {
    ...cameraData,
    id: uuidv4(),
    status: 'connecting',
    lastSeen: new Date().toISOString()
  };
  
  cameras.push(newCamera);
  localStorage.setItem('cameras', JSON.stringify(cameras));
  
  return newCamera;
};

// Delete a camera
export const deleteCamera = async (id: string): Promise<void> => {
  const storedCameras = localStorage.getItem('cameras');
  
  if (!storedCameras) {
    throw new Error('No cameras found');
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const cameras: Camera[] = JSON.parse(storedCameras);
  const updatedCameras = cameras.filter(camera => camera.id !== id);
  
  localStorage.setItem('cameras', JSON.stringify(updatedCameras));
};

// Start a camera stream
export const startStream = async (id: string): Promise<string> => {
  const storedCameras = localStorage.getItem('cameras');
  
  if (!storedCameras) {
    throw new Error('No cameras found');
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const cameras: Camera[] = JSON.parse(storedCameras);
  const camera = cameras.find(camera => camera.id === id);
  
  if (!camera) {
    throw new Error('Camera not found');
  }
  
  // In a real app, this would return an actual WebRTC URL
  const webrtcUrl = `wss://localhost:8188/${id}`;
  
  // Update the camera with webrtcUrl and status
  const updatedCameras = cameras.map(c => 
    c.id === id 
      ? { ...c, webrtcUrl, status: 'connecting' as const } 
      : c
  );
  
  localStorage.setItem('cameras', JSON.stringify(updatedCameras));
  
  return webrtcUrl;
};

// Update camera status
export const updateCameraStatus = async (
  id: string, 
  status: Camera['status']
): Promise<void> => {
  const storedCameras = localStorage.getItem('cameras');
  
  if (!storedCameras) {
    throw new Error('No cameras found');
  }
  
  const cameras: Camera[] = JSON.parse(storedCameras);
  const updatedCameras = cameras.map(camera => 
    camera.id === id 
      ? { 
          ...camera, 
          status, 
          lastSeen: status === 'online' ? new Date().toISOString() : camera.lastSeen 
        } 
      : camera
  );
  
  localStorage.setItem('cameras', JSON.stringify(updatedCameras));
};
