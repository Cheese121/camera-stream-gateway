
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCameras } from '@/context/CameraContext';
import { 
  Camera,
  Grid2X2,
  Settings,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { cameras, loading } = useCameras();
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const [uptime, setUptime] = useState<number>(0);
  
  useEffect(() => {
    // Simulate uptime progress
    const interval = setInterval(() => {
      setUptime(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Set system status based on cameras
    if (cameras.length === 0) {
      setSystemStatus('healthy');
      return;
    }
    
    const offlineCount = cameras.filter(cam => cam.status === 'offline').length;
    const offlineRatio = offlineCount / cameras.length;
    
    if (offlineRatio > 0.5) {
      setSystemStatus('error');
    } else if (offlineRatio > 0) {
      setSystemStatus('warning');
    } else {
      setSystemStatus('healthy');
    }
  }, [cameras]);
  
  const onlineCameras = cameras.filter(cam => cam.status === 'online').length;
  const offlineCameras = cameras.filter(cam => cam.status === 'offline').length;
  const connectingCameras = cameras.filter(cam => cam.status === 'connecting').length;
  
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Command Hub Overview</h1>
        <p className="text-muted-foreground">
          Monitor your camera system status and performance
        </p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : cameras.length}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : cameras.length === 0 ? 'No cameras added' : 'Cameras registered'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Cameras</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : onlineCameras}</div>
            <p className="text-xs text-muted-foreground">
              {loading 
                ? 'Loading...' 
                : cameras.length > 0 
                  ? `${Math.round((onlineCameras / cameras.length) * 100)}% online`
                  : 'No cameras added'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {systemStatus === 'healthy' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : systemStatus === 'warning' ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemStatus}</div>
            <p className="text-xs text-muted-foreground">
              {systemStatus === 'healthy' 
                ? 'All systems operational' 
                : systemStatus === 'warning'
                  ? `${offlineCameras} camera${offlineCameras !== 1 ? 's' : ''} offline`
                  : 'Multiple cameras offline'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-xs text-muted-foreground">30d</div>
              </div>
              <Progress value={uptime} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-24 flex flex-col justify-center items-center">
                <Link to="/dashboard">
                  <Grid2X2 className="h-8 w-8 mb-1" />
                  <span>Live View</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex flex-col justify-center items-center">
                <Link to="/cameras">
                  <Camera className="h-8 w-8 mb-1" />
                  <span>Manage Cameras</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex flex-col justify-center items-center">
                <Link to="/analytics">
                  <BarChart3 className="h-8 w-8 mb-1" />
                  <span>Analytics</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex flex-col justify-center items-center">
                <Link to="/settings">
                  <Settings className="h-8 w-8 mb-1" />
                  <span>Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Camera Status</CardTitle>
            <CardDescription>
              Overview of your camera system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : cameras.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Camera className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium">No Cameras Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first camera to start monitoring
                </p>
                <Button asChild>
                  <Link to="/cameras">Add Camera</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="status-dot online"></span>
                      <span>Online</span>
                    </div>
                    <span>{onlineCameras}</span>
                  </div>
                  <Progress value={(onlineCameras / cameras.length) * 100} className="h-2 bg-muted" />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <span className="status-dot connecting"></span>
                      <span>Connecting</span>
                    </div>
                    <span>{connectingCameras}</span>
                  </div>
                  <Progress value={(connectingCameras / cameras.length) * 100} className="h-2 bg-muted" />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <span className="status-dot offline"></span>
                      <span>Offline</span>
                    </div>
                    <span>{offlineCameras}</span>
                  </div>
                  <Progress value={(offlineCameras / cameras.length) * 100} className="h-2 bg-muted" />
                </div>
                
                <Button asChild>
                  <Link to="/dashboard">View Live Feeds</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
