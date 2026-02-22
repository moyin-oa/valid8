import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Download, AlertTriangle, CheckSquare, FileText, ChevronDown, Pill } from 'lucide-react';
import mockData from '../data/mock_contract.json';
import { apiUrl, exportSummaryPdf, generateTtsAudio } from '../lib/backendClient';

function normalizeResult(result) {
    if (!result) return mockData;

    const baseSummary = result.summary || {
        simple: result.simplifiedSummary || mockData.summary.simple,
        standard: result.simplifiedSummary || mockData.summary.standard,
        detailed: result.simplifiedSummary || mockData.summary.detailed,
    };

    return {
        ...mockData,
        ...result,
        summary: {
            simple: baseSummary.simple || baseSummary.standard || baseSummary.detailed || mockData.summary.simple,
            standard: baseSummary.standard || baseSummary.simple || baseSummary.detailed || mockData.summary.standard,
            detailed: baseSummary.detailed || baseSummary.standard || baseSummary.simple || mockData.summary.detailed,
        },
        action_items: Array.isArray(result.action_items)
            ? result.action_items
            : Array.isArray(result.actionItems)
                ? result.actionItems.map((item) => item.text || item)
                : mockData.action_items,
        warnings: Array.isArray(result.warnings) ? result.warnings : mockData.warnings,
        diagnoses: Array.isArray(result.diagnoses) ? result.diagnoses : mockData.diagnoses,
        medications: Array.isArray(result.medications) ? result.medications : mockData.medications,
        dates: Array.isArray(result.dates) ? result.dates : mockData.dates,
    };
}

export default function ResultsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const data = normalizeResult(location.state?.result);

    const [activeTab, setActiveTab] = useState('summary');
    const [readingLevel, setReadingLevel] = useState('standard');
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const audioRef = useRef(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const tabs = [
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'actions', label: 'Action Items', icon: CheckSquare },
        { id: 'alerts', label: `Alerts (${data.warnings.length})`, icon: AlertTriangle },
    ];

    const handleLevelChange = (e) => setReadingLevel(e.target.value);

    const buildTextToRead = () => {
        if (activeTab === 'summary') {
            return data.summary[readingLevel];
        }
        if (activeTab === 'actions') {
            return `Your Next Steps. ${data.action_items.map((item, i) => `${i + 1}: ${item}`).join('. ')}`;
        }
        return `Safety Checks and Warnings. ${data.warnings.join('. ')}`;
    };

    const playBrowserSpeech = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find((v) => v.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;
        utterance.pitch = 1.0;
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlaying(false);
        setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleReadAloud = async () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        const textToRead = data.ttsText || buildTextToRead();

        try {
            setAudioLoading(true);
            const documentId = data.documentId || `doc-${Date.now()}`;
            const tts = await generateTtsAudio(documentId, textToRead);
            const audio = new Audio(apiUrl(tts.audioUrl));
            audioRef.current = audio;
            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => {
                setIsPlaying(false);
                playBrowserSpeech(textToRead);
            };
            setIsPlaying(true);
            await audio.play();
        } catch (_error) {
            playBrowserSpeech(textToRead);
        } finally {
            setAudioLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            setDownloadLoading(true);
            const pdf = await exportSummaryPdf(data);
            window.open(apiUrl(pdf.downloadUrl), '_blank', 'noopener,noreferrer');
        } catch (_error) {
            window.print();
        } finally {
            setDownloadLoading(false);
        }
    };

    return (
        <div className="w-full pb-20">
            {data._error && (
                <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {data._error}
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 -ml-3 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-500 rounded-xl transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                    aria-label="Go back"
                    title="Go back to the previous page"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleReadAloud}
                        disabled={audioLoading}
                        className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[48px] text-sm font-bold rounded-xl transition-colors focus:ring-4 focus:ring-brand-500/50 ${isPlaying ? 'bg-brand-600 text-white shadow-md' : 'text-brand-700 bg-brand-50 hover:bg-brand-100'} disabled:opacity-60`}
                        aria-label={isPlaying ? 'Stop reading aloud' : 'Read summary aloud'}
                        aria-pressed={isPlaying}
                        title={isPlaying ? 'Stop reading' : 'Listen to the summary'}
                    >
                        <Volume2 size={20} className={isPlaying ? 'animate-pulse' : ''} />
                        <span className="hidden sm:inline">{audioLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Listen'}</span>
                    </button>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[48px] text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-500/50 disabled:opacity-60"
                        aria-label="Download PDF"
                        title="Download a PDF copy of this summary"
                        onClick={handleDownloadPdf}
                        disabled={downloadLoading}
                    >
                        <Download size={20} />
                        <span className="hidden sm:inline">{downloadLoading ? 'Preparing...' : 'PDF'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6" id="pdf-content-area">
                <div className="flex border-b border-gray-200" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 px-2 text-center text-sm font-medium transition-colors relative focus:outline-none min-h-[48px] ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-50'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <tab.icon size={18} className={tab.id === 'alerts' && activeTab !== 'alerts' ? 'text-amber-500' : ''} />
                                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                            </div>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            id={`panel-${activeTab}`}
                            role="tabpanel"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'summary' && (
                                <SummaryTab data={data} readingLevel={readingLevel} onLevelChange={handleLevelChange} />
                            )}
                            {activeTab === 'actions' && <ActionsTab data={data} />}
                            {activeTab === 'alerts' && <AlertsTab data={data} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function SummaryTab({ data, readingLevel, onLevelChange }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Document Summary</h3>
                <div className="relative">
                    <select
                        value={readingLevel}
                        onChange={onLevelChange}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-4 focus:ring-brand-500/50 focus:border-brand-500 block w-full p-2.5 pr-8 min-h-[48px]"
                        aria-label="Select reading level"
                    >
                        <option value="simple">Simple (5th Grade)</option>
                        <option value="standard">Standard (8th Grade)</option>
                        <option value="detailed">Detailed (12th Grade)</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
            </div>

            <div className="prose prose-brand max-w-none text-gray-700" aria-live="polite">
                <p className="text-lg leading-relaxed mb-4">
                    {data.summary[readingLevel]}
                </p>

                {data.diagnoses && data.diagnoses.length > 0 && (
                    <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
                        <h4 className="font-bold text-brand-900 mb-2">Diagnoses</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            {data.diagnoses.map((diag, i) => (
                                <li key={i} className="text-brand-800">
                                    <span className="font-semibold">{diag.name}:</span> {diag.plain_language}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionsTab({ data }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Your Next Steps</h3>

            <ul className="space-y-3">
                {data.action_items.map((item, i) => (
                    <li key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="mt-1 flex items-center min-h-[24px]">
                            <input type="checkbox" className="w-6 h-6 rounded border-gray-300 text-brand-600 focus:ring-4 focus:ring-brand-500/50" aria-label={`Mark as done: ${item}`} />
                        </div>
                        <span className="text-gray-800 text-lg leading-snug">{item}</span>
                    </li>
                ))}
            </ul>

            {data.dates && data.dates.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-3">Important Dates</h4>
                    <div className="space-y-2">
                        {data.dates.map((dateObj, i) => (
                            <div key={i} className="flex justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <span className="font-medium text-gray-700">{dateObj.event}</span>
                                <span className="text-brand-600 font-bold">{dateObj.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AlertsTab({ data }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Safety Checks</h3>

            {data.warnings && data.warnings.length > 0 ? (
                data.warnings.map((warning, i) => (
                    <div key={i} className="p-5 bg-amber-50 border border-amber-200 rounded-xl relative overflow-hidden mb-4">
                        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                        <div className="flex gap-4">
                            <div className="text-amber-500 mt-1">
                                <AlertTriangle size={24} aria-hidden="true" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-amber-900 mb-1">Warning</h4>
                                <p className="text-amber-800 text-base">{warning}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex gap-4">
                    <div className="text-green-500 mt-1">
                        <CheckSquare size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-green-900">No Critical Warnings</h4>
                        <p className="text-green-800 text-base">No immediate red flags were found in this document.</p>
                    </div>
                </div>
            )}

            {data.medications && data.medications.length > 0 && (
                <div className="mt-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Pill size={20} className="text-brand-500" />
                        Medications Found
                    </h4>
                    <div className="space-y-3">
                        {data.medications.map((med, i) => (
                            <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-brand-700 text-lg">{med.name} {med.dosage}</h5>
                                </div>
                                {med.frequency ? <p className="text-gray-600 mb-1"><span className="font-medium">Take:</span> {med.frequency}</p> : null}
                                {med.purpose ? <p className="text-gray-600"><span className="font-medium">For:</span> {med.purpose}</p> : null}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
