"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const DebatePage = () => {
    const [topic, setTopic] = useState('');
    const [userArgument, setUserArgument] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState('');
    type HistoryEntry = { argument: string; ai_response: string };
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const handleDebate = async () => {
        if (!topic.trim() || !userArgument.trim()) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:8000/debate/submit/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, argument: userArgument }),
            });

            const data = await response.json();
            const aiReply = data.ai_response;

            setHistory(prev => [
                ...prev,
                { argument: userArgument, ai_response: aiReply },
            ]);
            setAiResponse(aiReply);
            setUserArgument('');
        } catch (error) {
            console.error('Error fetching AI response:', error);
            setError('Failed to submit argument. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setError('');
        if (!topic.trim()) {
            setError('Please enter a topic before loading history.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/debate/history/?topic=${encodeURIComponent(topic)}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch history.');
            }

            const data = await response.json();
            const formatted = data.history.map((item: any) => ({
                argument: item.argument,
                ai_response: item.ai_response,
            }));
            setHistory(formatted);
        } catch (error: any) {
            console.error('Failed to fetch history:', error);
            setError(error.message || 'Unexpected error occurred.');
        }
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 px-4">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            🧠 Debatrix: Debate an AI
                        </h1>
                        <button
                            onClick={() => {
                                setDarkMode(!darkMode);
                                document.documentElement.classList.toggle('dark', !darkMode);
                            }}
                            className="text-sm px-3 py-1 border rounded-md border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Toggle {darkMode ? 'Light' : 'Dark'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="font-medium">Debate Topic</span>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Should AI be regulated?"
                                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </label>

                        <label className="block">
                            <span className="font-medium">Your Argument</span>
                            <textarea
                                value={userArgument}
                                onChange={(e) => setUserArgument(e.target.value)}
                                placeholder="Write your argument here..."
                                rows={4}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </label>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleDebate}
                                disabled={loading}
                                className={`flex-1 py-2 px-4 rounded-md text-white font-semibold ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {loading ? 'Debating...' : 'Submit Argument'}
                            </button>

                            <button
                                onClick={fetchHistory}
                                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                            >
                                Load History
                            </button>
                        </div>

                        {error && (
                            <div className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 border border-red-400 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>

                    <hr className="border-t border-gray-300 dark:border-gray-600" />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">🗣 Debate History</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {history.map((entry, idx) => (
                                <div key={idx} className="p-4 rounded-md bg-gray-100 dark:bg-gray-700 text-sm space-y-1">
                                    <p>🧑 <strong>You:</strong> {entry.argument}</p>
                                    <div>
                                        <p>🤖 <strong>AI:</strong></p>
                                        <div className="pl-4 mt-1 prose dark:prose-invert text-sm">
                                            <ReactMarkdown>{entry.ai_response}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebatePage;
