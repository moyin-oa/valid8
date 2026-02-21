import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileUp, Type, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from '../components/CameraCapture';

export default function LandingPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [showCamera, setShowCamera] = useState(false);
    const [showTextPaste, setShowTextPaste] = useState(false);
    const [pastedText, setPastedText] = useState('');

    const handleProcess = (data, type) => {
        navigate('/processing', { state: { inputData: data, inputType: type } });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            handleProcess(imageUrl, 'upload');
        }
        // reset input so the same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleTextSubmit = () => {
        if (pastedText.trim()) {
            handleProcess(pastedText, 'paste');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] pt-4 px-4 overflow-hidden">

            {/* Full Screen Camera View */}
            <AnimatePresence>
                {showCamera && (
                    <CameraCapture
                        onCapture={(imgData) => {
                            setShowCamera(false);
                            handleProcess(imgData, 'camera');
                        }}
                        onClose={() => setShowCamera(false)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg text-center space-y-8"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Understand your <span className="text-brand-600">health</span>.
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Scan any medical document to get a plain-language summary, action items, and safety alerts.
                    </p>
                </div>

                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />

                <AnimatePresence mode="wait">
                    {showTextPaste ? (
                        <motion.div
                            key="paste-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-left"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900">Paste Document Text</h3>
                                <button
                                    onClick={() => setShowTextPaste(false)}
                                    className="p-2 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <textarea
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                placeholder="Paste your medical instructions, discharge summary, or lab results here..."
                                className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 resize-none outline-none transition-all"
                            ></textarea>
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowTextPaste(false)}
                                    className="px-5 py-2.5 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTextSubmit}
                                    disabled={!pastedText.trim()}
                                    className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors flex items-center gap-2"
                                >
                                    Process <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="action-buttons"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 gap-4 mt-8"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowCamera(true)}
                                className="flex items-center p-6 bg-brand-600 text-white rounded-2xl shadow-lg hover:bg-brand-700 transition-colors group focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                                aria-label="Scan your document with camera"
                            >
                                <div className="bg-white/20 p-4 rounded-xl mr-6 group-hover:scale-110 transition-transform">
                                    <Camera size={32} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-xl font-semibold">Scan your document</span>
                                    <span className="block text-brand-100 text-sm mt-1">Take a photo with your device camera</span>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center p-6 bg-white border-2 border-gray-200 text-gray-800 rounded-2xl shadow-sm hover:border-brand-500 hover:bg-brand-50 transition-colors group focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                                aria-label="Upload a file or image"
                            >
                                <div className="bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600 p-4 rounded-xl mr-6 transition-colors">
                                    <FileUp size={32} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-xl font-semibold">Upload file</span>
                                    <span className="block text-gray-500 text-sm mt-1">Select an image or PDF from your device</span>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowTextPaste(true)}
                                className="flex items-center p-6 bg-white border-2 border-gray-200 text-gray-800 rounded-2xl shadow-sm hover:border-brand-500 hover:bg-brand-50 transition-colors group focus:outline-none focus:ring-4 focus:ring-brand-500/50"
                                aria-label="Paste text directly"
                            >
                                <div className="bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600 p-4 rounded-xl mr-6 transition-colors">
                                    <Type size={32} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-xl font-semibold">Paste text</span>
                                    <span className="block text-gray-500 text-sm mt-1">Type or paste text directly</span>
                                </div>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
