import { useRef, useState, useEffect } from 'react';
import { X, Camera as CameraIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState('');
    const streamRef = useRef(null);

    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError('Failed to open camera. Please check camera permissions in your browser.');
                console.error('Camera error:', err);
            }
        }

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Match canvas to video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            onCapture(imageDataUrl);
        }
    };

    const handleClose = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                streamRef.current.removeTrack(track);
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center safe-area-pt"
        >
            <div className="absolute top-4 right-4 z-[110]">
                <button
                    onClick={handleClose}
                    className="p-3 bg-gray-900/60 text-white rounded-full hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-white"
                    aria-label="Close camera"
                >
                    <X size={24} />
                </button>
            </div>

            {error ? (
                <div className="text-white text-center p-8 max-w-sm">
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <CameraIcon size={32} />
                    </div>
                    <p className="text-lg leading-relaxed mb-6">{error}</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors w-full"
                    >
                        Go Back
                    </button>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCapture}
                            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-500 shadow-2xl"
                            aria-label="Take photo"
                        >
                            <div className="w-[60px] h-[60px] bg-white border-2 border-gray-200 rounded-full shadow-inner"></div>
                        </motion.button>
                    </div>
                </>
            )}
        </motion.div>
    );
}
