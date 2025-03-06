
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCameras } from '@/context/CameraContext';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define a schema that ensures required fields match what the API expects
const cameraSchema = z.object({
  name: z.string().min(1, 'Camera name is required'),
  rtspUrl: z.string().url('Must be a valid URL').min(1, 'RTSP URL is required'),
  location: z.string().optional(),
});

type CameraFormData = z.infer<typeof cameraSchema>;

export function AddCameraModal({ isOpen, onClose }: AddCameraModalProps) {
  const { addNewCamera } = useCameras();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CameraFormData>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      name: '',
      rtspUrl: '',
      location: '',
    }
  });

  const onSubmit = async (data: CameraFormData) => {
    try {
      // Ensure we only submit when we have the required fields (name and rtspUrl are required by the schema)
      await addNewCamera({
        name: data.name,
        rtspUrl: data.rtspUrl,
        location: data.location,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add camera:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Camera Name</Label>
            <Input 
              id="name" 
              placeholder="e.g., Front Entrance Camera" 
              {...register('name')} 
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rtspUrl">RTSP Stream URL</Label>
            <Input 
              id="rtspUrl" 
              placeholder="rtsp://example.com/stream" 
              {...register('rtspUrl')} 
            />
            {errors.rtspUrl && (
              <p className="text-sm text-red-500">{errors.rtspUrl.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input 
              id="location" 
              placeholder="e.g., Main Building" 
              {...register('location')} 
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Camera'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
