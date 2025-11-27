import { useRef, useState, useEffect } from 'react';
import { Button } from './Button';

interface WebCameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  width?: number;
  height?: number;
}

export function WebCameraCapture({
  onCapture,
  width = 640,
  height = 480,
}: WebCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the video frame to the canvas
    ctx.drawImage(video, 0, 0);

    // Convert to base64
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageBase64);
    
    // Stop the camera
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
        <svg className="w-12 h-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-center text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={startCamera}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Camera View */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-auto"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              </div>
            )}
          </>
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {capturedImage ? (
          <>
            <Button variant="outline" onClick={handleRetake}>
              Retake Photo
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Use This Photo
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={handleCapture}
            disabled={isLoading || !stream}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            Capture Photo
          </Button>
        )}
      </div>
    </div>
  );
}
