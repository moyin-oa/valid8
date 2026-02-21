import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProcessingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const inputType = location.state?.inputType || 'document';
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate processing time 3-8 seconds
        const duration = Math.floor(Math.random() * 5000) + 3000;
        const intervalTime = 100;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                clearInterval(timer);
                navigate('/results');
            } else {
                setProgress(Math.round((currentStep / steps) * 100));
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
            >
                <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="46"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-brand-500 transition-all duration-300 ease-out"
                            strokeDasharray={289}
                            strokeDashoffset={289 - (289 * progress) / 100}
                        />
                    </svg>
                    <div className="relative bg-brand-50 p-4 rounded-full text-brand-600">
                        <FileText size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reading your document...</h2>
                <p className="text-gray-500 mb-8">
                    Our AI is translating medical terms into plain language.
                </p>

                <div className="flex flex-col gap-3 text-sm font-medium text-gray-500 text-left">
                    <div className="flex items-center gap-3">
                        {progress > 20 ? <CheckCircle /> : <Loader2 className="w-5 h-5 animate-spin text-brand-400" />}
                        <span className={progress > 20 ? "text-gray-800" : ""}>Extracting text...</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {progress > 50 ? <CheckCircle /> : progress > 20 ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : <div className="w-5 h-5" />}
                        <span className={progress > 50 ? "text-gray-800" : progress > 20 ? "" : "opacity-40"}>Simplifying language...</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {progress > 85 ? <CheckCircle /> : progress > 50 ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : <div className="w-5 h-5" />}
                        <span className={progress > 85 ? "text-gray-800" : progress > 50 ? "" : "opacity-40"}>Checking drug interactions...</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function CheckCircle() {
    return (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
