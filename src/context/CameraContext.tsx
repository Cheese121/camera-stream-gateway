
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";
import { fetchCameras, addCamera, deleteCamera } from '@/utils/api';

export type CameraStatus = 'online' | 'offline' | 'connecting';

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location?: string;
  status: CameraStatus;
  lastSeen?: string;
  webrtcUrl?: string;
}

interface CameraContextType {
  cameras: Camera[];
  loading: boolean;
  addNewCamera: (cameraData: Omit<Camera, 'id' | 'status'>) => Promise<void>;
  removeCamera: (id: string) => Promise<void>;
  refreshCameras: () => Promise<void>;
  updateCameraStatus: (id: string, status: CameraStatus) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const useCameras = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCameras must be used within a CameraProvider');
  }
  return context;
};

export const CameraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCameras = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from a real API
      // For now, we'll use mock data
      const result = await fetchCameras();
      setCameras(result);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
      toast({
        title: "Error",
        description: "Failed to load cameras. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const addNewCamera = async (cameraData: Omit<Camera, 'id' | 'status'>) => {
    try {
      // In a real app, this would call an API
      const newCamera = await addCamera(cameraData);
      setCameras(prev => [...prev, newCamera]);
      toast({
        title: "Camera Added",
        description: `${cameraData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Failed to add camera:', error);
      toast({
        title: "Error",
        description: "Failed to add camera. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeCamera = async (id: string) => {
    try {
      // In a real app, this would call an API
      await deleteCamera(id);
      setCameras(prev => prev.filter(camera => camera.id !== id));
      toast({
        title: "Camera Removed",
        description: "The camera has been removed successfully.",
      });
    } catch (error) {
      console.error('Failed to remove camera:', error);
      toast({
        title: "Error",
        description: "Failed to remove camera. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshCameras = async () => {
    await loadCameras();
  };

  const updateCameraStatus = (id: string, status: CameraStatus) => {
    setCameras(prev => 
      prev.map(camera => 
        camera.id === id ? { ...camera, status } : camera
      )
    );
  };

  return (
    <CameraContext.Provider 
      value={{ 
        cameras, 
        loading, 
        addNewCamera, 
        removeCamera, 
        refreshCameras,
        updateCameraStatus
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};
