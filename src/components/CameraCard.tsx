
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraStatus } from '@/context/CameraContext';
import { connectToStream, disconnectFromStream } from '@/utils/webrtc';
import { 
  Play, 
  Pause, 
  Maximize, 
  RefreshCw, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CameraCardProps {
  camera: Camera;
  isFullscreenable?: boolean;
  onFullscreen?: () => void;
}

export function CameraCard({ camera, isFullscreenable = true, onFullscreen }: CameraCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>(camera.status);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (newStatus: CameraStatus) => {
    setStatus(newStatus);
    
    if (newStatus === 'online') {
      setIsPlaying(true);
      setIsLoading(false);
    } else if (newStatus === 'connecting') {
      setIsLoading(true);
    } else {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const toggleStream = async () => {
    if (isPlaying) {
      disconnectFromStream(camera.id);
      setIsPlaying(false);
      handleStatusChange('offline');
    } else {
      setIsLoading(true);
      
      if (videoRef.current) {
        try {
          await connectToStream(camera, videoRef.current, handleStatusChange);
        } catch (error) {
          console.error('Failed to connect to stream:', error);
          setIsLoading(false);
        }
      }
    }
  };

  const handleFullscreen = () => {
    if (onFullscreen) {
      onFullscreen();
    }
  };

  const reconnect = async () => {
    setIsLoading(true);
    
    if (videoRef.current) {
      disconnectFromStream(camera.id);
      
      try {
        await connectToStream(camera, videoRef.current, handleStatusChange);
      } catch (error) {
        console.error('Failed to reconnect to stream:', error);
        setIsLoading(false);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectFromStream(camera.id);
    };
  }, [camera.id]);

  const formatLastSeen = (lastSeenDate?: string) => {
    if (!lastSeenDate) return 'Never';
    
    try {
      return formatDistanceToNow(new Date(lastSeenDate), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <span 
              className={cn(
                "status-dot",
                status === 'online' ? 'online' : 
                status === 'connecting' ? 'connecting' : 'offline'
              )}
            />
            {camera.name}
          </CardTitle>
          <Badge 
            variant={status === 'online' ? 'default' : 
                   status === 'connecting' ? 'outline' : 'secondary'}
            className="animate-fade-in"
          >
            {status === 'online' ? 'Online' : 
             status === 'connecting' ? 'Connecting...' : 'Offline'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isPlaying ? "opacity-100" : "opacity-0"
            )}
            muted
            playsInline
          />
          
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-800">
              <Camera size={40} className="mb-2 opacity-40" />
              <p className="text-sm opacity-60">Stream not active</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-800">
              <RefreshCw size={32} className="mb-2 opacity-70 animate-spin" />
              <p className="text-sm opacity-60">Connecting...</p>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-200 hover:opacity-100">
            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="opacity-80" />
                <span className="text-xs text-white/90">{camera.location || 'No location'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} className="opacity-80" />
                <span className="text-xs text-white/90">
                  {status === 'online' ? 'Live' : `Last seen ${formatLastSeen(camera.lastSeen)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleStream}
            disabled={isLoading}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={reconnect}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
        
        {isFullscreenable && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleFullscreen}
          >
            <Maximize size={16} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
