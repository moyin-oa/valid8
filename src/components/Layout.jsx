import { Link } from 'react-router-dom';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-brand-100">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1 -ml-1">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                            M
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">MedLens</span>
                    </Link>
                </div>
            </header>
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
