
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddCameraModal } from '@/components/AddCameraModal';
import { useCameras, Camera } from '@/context/CameraContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Camera as CameraIcon, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Search,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CameraManager = () => {
  const { cameras, loading, removeCamera, refreshCameras } = useCameras();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCamera, setDeletingCamera] = useState<Camera | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const filteredCameras = cameras.filter(camera => 
    camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (camera.location && camera.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCameras();
    setIsRefreshing(false);
  };
  
  const confirmDelete = (camera: Camera) => {
    setDeletingCamera(camera);
  };
  
  const handleDelete = async () => {
    if (deletingCamera) {
      await removeCamera(deletingCamera.id);
      setDeletingCamera(null);
    }
  };
  
  const getStatusLabel = (status: Camera['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'connecting':
        return <Badge variant="outline" className="animate-pulse">Connecting...</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const formatLastSeen = (lastSeenDate?: string) => {
    if (!lastSeenDate) return 'Never';
    
    try {
      return formatDistanceToNow(new Date(lastSeenDate), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Camera Management</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading cameras...' : 
             `${cameras.length} camera${cameras.length !== 1 ? 's' : ''} configured`}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cameras..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
          
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-2" />
            Add Camera
          </Button>
        </div>
      </header>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <RefreshCw size={40} className="text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading cameras...</p>
        </div>
      ) : filteredCameras.length === 0 ? (
        <Card className="w-full p-8 flex flex-col items-center justify-center">
          <CardHeader className="text-center">
            <CameraIcon size={40} className="mx-auto text-muted-foreground opacity-40 mb-4" />
            <CardTitle>No Cameras Found</CardTitle>
            <CardDescription>
              {searchQuery ? 'No cameras match your search query' : 'Add your first camera to get started'}
            </CardDescription>
          </CardHeader>
          
          {!searchQuery && (
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus size={16} className="mr-2" />
              Add Your First Camera
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredCameras.map((camera) => (
              <div 
                key={camera.id} 
                className="bg-card rounded-lg shadow-sm border border-border transition-all hover:shadow-md"
              >
                <div className="grid md:grid-cols-[1fr_auto] gap-4 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className={
                          camera.status === 'online' 
                            ? 'status-dot online' 
                            : camera.status === 'connecting'
                              ? 'status-dot connecting'
                              : 'status-dot offline'
                        }
                      />
                      <h3 className="text-lg font-medium">{camera.name}</h3>
                      {getStatusLabel(camera.status)}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ExternalLink size={14} />
                        <span className="truncate">{camera.rtspUrl}</span>
                      </div>
                      
                      {camera.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={14} />
                          <span>{camera.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Last seen:</span>
                        <span>{formatLastSeen(camera.lastSeen)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a href="/dashboard">
                        <ExternalLink size={14} className="mr-1" />
                        View Feed
                      </a>
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => confirmDelete(camera)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <AddCameraModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      <AlertDialog 
        open={!!deletingCamera} 
        onOpenChange={(open) => !open && setDeletingCamera(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Camera</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCamera?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CameraManager;
