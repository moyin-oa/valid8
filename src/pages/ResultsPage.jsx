import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Download, AlertTriangle, CheckSquare, FileText, ChevronDown } from 'lucide-react';

export default function ResultsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('summary');
    const [readingLevel, setReadingLevel] = useState('standard');
    const [isPlaying, setIsPlaying] = useState(false);

    const tabs = [
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'actions', label: 'Action Items', icon: CheckSquare },
        { id: 'alerts', label: 'Alerts (1)', icon: AlertTriangle },
    ];

    const handleLevelChange = (e) => setReadingLevel(e.target.value);

    const handleReadAloud = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        let textToRead = "";
        if (activeTab === 'summary') {
            if (readingLevel === 'simple') {
                textToRead = "You went to the hospital today because your chest hurt and it was hard to breathe. The doctor thinks this was caused by heartburn, not your heart. Your heart tests were perfectly fine. You can go home now, but please see your regular doctor next week to make sure everything is okay.";
            } else if (readingLevel === 'standard') {
                textToRead = "You visited the emergency room today for chest pain and shortness of breath. The doctor believes this was caused by acid reflux, not your heart. Your heart tests (EKG and blood work) were completely normal. You are safe to go home, but you need to follow up with your primary doctor next week.";
            } else if (readingLevel === 'detailed') {
                textToRead = "Patient presented to the ED with complaints of chest pain and dyspnea. Initial evaluation suggests gastroesophageal reflux disease (GERD) rather than a cardiac event. Cardiac workup, including ECG and troponin levels, was unremarkable. Patient is stable for discharge with instructions to follow up with their primary care physician within 7 days for further evaluation and management of suspected GERD.";
            }
        } else if (activeTab === 'actions') {
            textToRead = "Your Next Steps. 1: Schedule a follow-up with Dr. Smith within 7 days. 2: Take Omeprazole 20 milligrams once every morning 30 minutes before eating. 3: Avoid spicy foods and eating within 3 hours of bedtime. 4: Return to the ER right away if the chest pain comes back, gets worse, or moves to your arm or jaw.";
        } else if (activeTab === 'alerts') {
            textToRead = "Safety Checks. Potential Interaction: We noticed you are taking Clopidogrel, also known as Plavix. Your new prescription, Omeprazole, can sometimes make Clopidogrel less effective. Action: Call your primary doctor or pharmacist tomorrow to check if you should use a different stomach medicine. Dosage Check Passed: Your prescribed dosages look standard and safe.";
        }

        const utterance = new SpeechSynthesisUtterance(textToRead);

        // Specifically look for built-in high-quality feminine English voices
        const voices = window.speechSynthesis.getVoices();
        const feminineVoice = voices.find(voice =>
            voice.name.includes('Zira') ||       // Windows Female
            voice.name.includes('Samantha') ||   // Mac Female
            voice.name.includes('Google US English') || // Chrome Female
            voice.name.includes('Susan') ||
            (voice.name.includes('Female') && voice.lang.startsWith('en'))
        );

        if (feminineVoice) {
            utterance.voice = feminineVoice;
        } else {
            // Fallback for English
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) utterance.voice = englishVoice;
        }

        utterance.pitch = 1.1; // Slightly higher pitch for a more feminine/soothing tone
        utterance.rate = 0.9;  // Slightly slower 

        utterance.onend = () => setIsPlaying(false);

        setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
    };

    // Ensure voices are loaded (sometimes they load asynchronously)
    if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    const handleDownloadPdf = async () => {
        try {
            // Import html2pdf dynamically
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            // Grab the content area
            const element = document.getElementById('pdf-content-area');
            if (!element) return;

            const opt = {
                margin: 10,
                filename: 'MedLens_Summary.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Add a temporary class to format it nicely for PDF
            element.classList.add('pdf-mode');

            // Wait for generation to save
            await html2pdf().set(opt).from(element).save();

            // Cleanup
            element.classList.remove('pdf-mode');
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Sorry, there was an issue generating the PDF. Please try again.");
        }
    };

    return (
        <div className="w-full pb-20">
            {/* Header */}
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
                        className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[48px] text-sm font-bold rounded-xl transition-colors focus:ring-4 focus:ring-brand-500/50 ${isPlaying ? 'bg-brand-600 text-white shadow-md' : 'text-brand-700 bg-brand-50 hover:bg-brand-100'}`}
                        aria-label={isPlaying ? "Stop reading aloud" : "Read summary aloud"}
                        aria-pressed={isPlaying}
                        title={isPlaying ? "Stop reading" : "Listen to the summary"}
                    >
                        <Volume2 size={20} className={isPlaying ? "animate-pulse" : ""} />
                        <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Listen'}</span>
                    </button>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 min-h-[48px] text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-500/50"
                        aria-label="Download PDF"
                        title="Download a PDF copy of this summary"
                        onClick={handleDownloadPdf}
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6" id="pdf-content-area">
                <div className="flex border-b border-gray-200" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 px-2 text-center text-sm font-medium transition-colors relative focus:outline-none min-h-[48px] ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                                }`}
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
                                <SummaryTab readingLevel={readingLevel} onLevelChange={handleLevelChange} />
                            )}
                            {activeTab === 'actions' && <ActionsTab />}
                            {activeTab === 'alerts' && <AlertsTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function SummaryTab({ readingLevel, onLevelChange }) {
    const summaries = {
        simple: (
            <>
                <p className="text-lg leading-relaxed mb-4">
                    You went to the hospital today because your chest hurt and it was hard to breathe. The doctor thinks this was caused by heartburn, not your heart.
                </p>
                <p className="text-lg leading-relaxed">
                    Your heart tests were perfectly fine. You can go home now, but please see your regular doctor next week to make sure everything is okay.
                </p>
            </>
        ),
        standard: (
            <>
                <p className="text-lg leading-relaxed mb-4">
                    You visited the emergency room today for chest pain and shortness of breath. The doctor believes this was caused by acid reflux, not your heart.
                </p>
                <p className="text-lg leading-relaxed">
                    Your heart tests (EKG and blood work) were completely normal. You are safe to go home, but you need to follow up with your primary doctor next week.
                </p>
            </>
        ),
        detailed: (
            <>
                <p className="text-lg leading-relaxed mb-4">
                    Patient presented to the ED with complaints of chest pain and dyspnea. Initial evaluation suggests gastroesophageal reflux disease (GERD) rather than a cardiac event.
                </p>
                <p className="text-lg leading-relaxed">
                    Cardiac workup, including ECG and troponin levels, was unremarkable. Patient is stable for discharge with instructions to follow up with their primary care physician within 7 days for further evaluation and management of suspected GERD.
                </p>
            </>
        )
    };

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
                {summaries[readingLevel]}
            </div>
        </div>
    );
}

function ActionsTab() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Your Next Steps</h3>

            <ul className="space-y-3">
                {[
                    "Schedule a follow-up with Dr. Smith within 7 days.",
                    "Take Omeprazole (20mg) once every morning 30 minutes before eating.",
                    "Avoid spicy foods and eating within 3 hours of bedtime.",
                    "Return to the ER right away if the chest pain comes back, gets worse, or moves to your arm or jaw."
                ].map((item, i) => (
                    <li key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="mt-1 flex items-center min-h-[24px]">
                            <input type="checkbox" className="w-6 h-6 rounded border-gray-300 text-brand-600 focus:ring-4 focus:ring-brand-500/50" aria-label={`Mark as done: ${item}`} />
                        </div>
                        <span className="text-gray-800 text-lg leading-snug">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function AlertsTab() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Safety Checks</h3>

            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                <div className="flex gap-4">
                    <div className="text-amber-500 mt-1">
                        <AlertTriangle size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-amber-900 mb-1">Potential Interaction</h4>
                        <p className="text-amber-800 mb-3 text-base">
                            We noticed you are taking <strong className="font-bold">Clopidogrel (Plavix)</strong>. Your new prescription, <strong className="font-bold">Omeprazole</strong>, can sometimes make Clopidogrel less effective.
                        </p>
                        <div className="bg-amber-100/50 p-4 rounded-lg text-amber-900 text-sm font-bold border border-amber-200">
                            Action: Call your primary doctor or pharmacist tomorrow to check if you should use a different stomach medicine.
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex gap-4">
                <div className="text-green-500 mt-1">
                    <CheckSquare size={24} aria-hidden="true" />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-green-900">Dosage Check Passed</h4>
                    <p className="text-green-800 text-base">Your prescribed dosages look standard and safe.</p>
                </div>
            </div>
        </div>
    );
}
