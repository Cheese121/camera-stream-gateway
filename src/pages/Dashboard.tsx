
import React, { useState } from 'react';
import { CameraCard } from '@/components/CameraCard';
import { Button } from '@/components/ui/button';
import { useCameras } from '@/context/CameraContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Grid2X2, Grid3X3, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Dashboard = () => {
  const { cameras, loading } = useCameras();
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<'2x2' | '3x3'>('2x2');
  
  const filteredCameras = cameras.filter(camera => camera.status !== 'offline');
  const hasOfflineCameras = cameras.some(camera => camera.status === 'offline');
  
  const handleFullscreen = (cameraId: string) => {
    setFullscreenCamera(cameraId);
  };
  
  const closeFullscreen = () => {
    setFullscreenCamera(null);
  };
  
  const getSelectedCamera = () => {
    return cameras.find(camera => camera.id === fullscreenCamera);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Live View Dashboard</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading cameras...' : 
             `${filteredCameras.length} active camera${filteredCameras.length !== 1 ? 's' : ''}`}
             {hasOfflineCameras ? ` (${cameras.length - filteredCameras.length} offline)` : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={gridSize} 
            onValueChange={(value) => setGridSize(value as '2x2' | '3x3')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Grid Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2x2">
                <div className="flex items-center gap-2">
                  <Grid2X2 size={16} />
                  <span>2×2 Grid</span>
                </div>
              </SelectItem>
              <SelectItem value="3x3">
                <div className="flex items-center gap-2">
                  <Grid3X3 size={16} />
                  <span>3×3 Grid</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 size={40} className="text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading camera streams...</p>
        </div>
      ) : filteredCameras.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-lg border border-border">
          <div className="max-w-md text-center">
            <h3 className="text-lg font-medium mb-2">No active cameras found</h3>
            <p className="text-muted-foreground mb-4">
              {cameras.length === 0 
                ? "Add cameras to start monitoring your spaces."
                : "None of your cameras are currently online."}
            </p>
            <Button asChild>
              <a href="/cameras">Manage Cameras</a>
            </Button>
          </div>
        </div>
      ) : (
        <div className={`grid gap-4 ${gridSize === '2x2' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {filteredCameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onFullscreen={() => handleFullscreen(camera.id)}
            />
          ))}
        </div>
      )}
      
      <Dialog open={!!fullscreenCamera} onOpenChange={closeFullscreen}>
        <DialogContent className="max-w-4xl">
          {getSelectedCamera() && (
            <CameraCard
              camera={getSelectedCamera()!}
              isFullscreenable={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
