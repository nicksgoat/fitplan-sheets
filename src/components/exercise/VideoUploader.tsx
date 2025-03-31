
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Upload, 
  Video as VideoIcon, 
  X, 
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { uploadExerciseVideo } from '@/services/exerciseLibraryService';

interface VideoUploaderProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  onVideoFileChange?: (file: File | null) => void;
  className?: string;
}

// Maximum video size (50MB)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
// Allowed video file types
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoUrl,
  onVideoUrlChange,
  onVideoFileChange,
  className
}) => {
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>(videoUrl ? 'url' : 'file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>(videoUrl || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetVideoFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateAndSetVideoFile = (file: File) => {
    setUploadError(null);
    
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      const errorMsg = 'Invalid file type. Please upload MP4, WebM, or QuickTime video.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }
    
    if (file.size > MAX_VIDEO_SIZE) {
      const errorMsg = 'Video is too large. Maximum size is 50MB.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }
    
    setVideoFile(file);
    if (onVideoFileChange) {
      onVideoFileChange(file);
    }
    
    // Create a local URL for preview
    const localPreviewUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(localPreviewUrl);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetVideoFile(files[0]);
    }
  };

  const handleClearVideo = () => {
    setVideoFile(null);
    setVideoPreviewUrl('');
    onVideoUrlChange('');
    if (onVideoFileChange) {
      onVideoFileChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video file first');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      // Upload the video file
      const uploadedVideoUrl = await uploadExerciseVideo(videoFile, user?.id);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set the video URL
      onVideoUrlChange(uploadedVideoUrl);
      
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onVideoUrlChange(url);
    if (url) {
      setVideoPreviewUrl(url);
    } else {
      setVideoPreviewUrl('');
    }
  };

  return (
    <div className={className}>
      <Tabs value={uploadTab} onValueChange={(value) => setUploadTab(value as 'file' | 'url')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">Video URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="pt-4">
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Video Upload Guidelines</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                <li>Maximum file size: <strong>50MB</strong></li>
                <li>Supported formats: MP4, WebM, QuickTime</li>
                <li>For larger videos, use the URL option with YouTube or other video hosts</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
          
          {!videoPreviewUrl && (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Drop your video here or click to browse</p>
                <p className="text-xs text-gray-500 mt-1">MP4, WebM or QuickTime, up to 50MB</p>
              </div>
            </div>
          )}
          
          {videoPreviewUrl && uploadTab === 'file' && (
            <div className="relative mt-4 rounded-lg overflow-hidden">
              <video 
                src={videoPreviewUrl} 
                controls 
                className="w-full h-auto max-h-[300px]"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleClearVideo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {videoFile && !videoUrl && (
            <div className="mt-2">
              <Button 
                type="button" 
                onClick={handleVideoUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  'Upload Video'
                )}
              </Button>
            </div>
          )}
          
          {videoUrl && uploadTab === 'file' && (
            <div className="mt-2">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800 flex items-center">
                <VideoIcon className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-600">Video uploaded successfully</span>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="url" className="pt-4">
          <div className="flex">
            <div className="relative w-full">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="https://example.com/video.mp4" 
                className="pl-10" 
                value={videoUrl}
                onChange={handleUrlChange}
              />
            </div>
          </div>
          
          {videoUrl && uploadTab === 'url' && (
            <div className="relative mt-4 rounded-lg overflow-hidden">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-auto max-h-[300px]"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleClearVideo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoUploader;
