import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { processPipeline } from '../lib/backendClient';
import mockData from '../data/mock_contract.json';

function fallbackResult(errorMessage) {
    return {
        ...mockData,
        _error: errorMessage,
        ttsText: mockData.summary?.standard || '',
    };
}

export default function ProcessingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const input = location.state || {};
    const [progress, setProgress] = useState(5);

    useEffect(() => {
        let isActive = true;
        let done = false;
        let current = 5;

        const timer = setInterval(() => {
            if (!isActive) return;
            if (done) {
                current = 100;
            } else if (current < 92) {
                current += 2;
            }
            setProgress(current);
        }, 120);

        async function runPipeline() {
            try {
                const result = await processPipeline(input);
                if (!isActive) return;
                done = true;
                setProgress(100);
                setTimeout(() => {
                    if (isActive) {
                        navigate('/results', { state: { result, sourceInput: input } });
                    }
                }, 250);
            } catch (error) {
                if (!isActive) return;
                done = true;
                setProgress(100);
                const message = error instanceof Error ? error.message : 'Unknown processing error';
                setTimeout(() => {
                    if (isActive) {
                        navigate('/results', {
                            state: {
                                result: fallbackResult(`Live backend unavailable: ${message}`),
                                sourceInput: input,
                                usedFallback: true,
                            },
                        });
                    }
                }, 250);
            }
        }

        runPipeline();

        return () => {
            isActive = false;
            clearInterval(timer);
        };
    }, [navigate, input]);

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
                    Running AI simplification and medication safety checks.
                </p>

                <div className="flex flex-col gap-3 text-sm font-medium text-gray-500 text-left">
                    <div className="flex items-center gap-3">
                        {progress > 20 ? <CheckCircle /> : <Loader2 className="w-5 h-5 animate-spin text-brand-400" />}
                        <span className={progress > 20 ? 'text-gray-800' : ''}>Extracting text...</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {progress > 50 ? <CheckCircle /> : progress > 20 ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : <div className="w-5 h-5" />}
                        <span className={progress > 50 ? 'text-gray-800' : progress > 20 ? '' : 'opacity-40'}>Simplifying language...</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {progress > 85 ? <CheckCircle /> : progress > 50 ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : <div className="w-5 h-5" />}
                        <span className={progress > 85 ? 'text-gray-800' : progress > 50 ? '' : 'opacity-40'}>Checking drug interactions...</span>
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
