
import React, { useState, useEffect, useRef } from 'react';
import { TimerMode, TimerSettings } from '../types';
import { Play, Pause, RefreshCcw, Settings, X, Save } from 'lucide-react';

const DEFAULT_SETTINGS: TimerSettings = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15
};

export const FocusTab: React.FC = () => {
    // --- Timer Settings State ---
    const [settings, setSettings] = useState<TimerSettings>(() => {
        const saved = localStorage.getItem('timerSettings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    // Temp state for editing settings
    const [editSettings, setEditSettings] = useState<TimerSettings>(settings);

    // --- Timer State ---
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(settings[mode] * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const timerRef = useRef<number | null>(null);

    // Save settings when changed
    useEffect(() => {
        localStorage.setItem('timerSettings', JSON.stringify(settings));
    }, [settings]);

    // --- Timer Logic ---
    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, mode, settings]); // Depend on settings too in case they change mid-run (though we pause on open)

    const handleTimerComplete = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        
        // Play notification
        try {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play();
        } catch (e) { console.log("Audio blocked"); }

        if (window.Notification && Notification.permission === "granted") {
            new Notification(mode === 'focus' ? "Focus session complete!" : "Break is over!");
        } else if (window.Notification && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        // Auto-switch modes
        if (mode === 'focus') {
            setSessionsCompleted(prev => prev + 1);
            const newMode = (sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
            setMode(newMode);
            setTimeLeft(settings[newMode] * 60);
        } else {
            setMode('focus');
            setTimeLeft(settings.focus * 60);
        }
    };

    const toggleTimer = () => setIsRunning(!isRunning);
    
    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(settings[mode] * 60);
    };

    const changeMode = (newMode: TimerMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(settings[newMode] * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- Settings Handlers ---
    const openSettings = () => {
        setIsRunning(false); // Pause when opening settings
        setEditSettings(settings);
        setIsSettingsOpen(true);
    };

    const saveSettings = () => {
        setSettings(editSettings);
        setIsSettingsOpen(false);
        // Reset current timer to new setting
        setTimeLeft(editSettings[mode] * 60);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                {/* Settings Button */}
                <button 
                    onClick={openSettings}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                    <Settings size={24} />
                </button>

                <div className="flex bg-gray-800/50 p-1.5 rounded-xl mb-12 relative z-10">
                    <button 
                        onClick={() => changeMode('focus')}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all ${mode === 'focus' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Focus
                    </button>
                    <button 
                        onClick={() => changeMode('shortBreak')}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all ${mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Short Break
                    </button>
                    <button 
                        onClick={() => changeMode('longBreak')}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all ${mode === 'longBreak' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Long Break
                    </button>
                </div>

                <div className="text-[150px] sm:text-[180px] leading-none font-mono font-bold tracking-tighter mb-12 relative z-10">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <button 
                        onClick={toggleTimer}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-gray-700'} text-white`}
                    >
                        {isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="p-5 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                    >
                        <RefreshCcw size={28} />
                    </button>
                </div>
                 <p className="mt-8 text-gray-500 uppercase tracking-widest text-sm relative z-10">
                    {mode === 'focus' ? 'Time to focus' : 'Take a breather'}
                </p>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsSettingsOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Timer Settings</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Focus Duration (minutes)</label>
                                <input 
                                    type="number" min="1" max="120"
                                    value={editSettings.focus}
                                    onChange={e => setEditSettings({...editSettings, focus: parseInt(e.target.value) || 1})}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Short Break (minutes)</label>
                                <input 
                                    type="number" min="1" max="60"
                                    value={editSettings.shortBreak}
                                    onChange={e => setEditSettings({...editSettings, shortBreak: parseInt(e.target.value) || 1})}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Long Break (minutes)</label>
                                <input 
                                    type="number" min="1" max="60"
                                    value={editSettings.longBreak}
                                    onChange={e => setEditSettings({...editSettings, longBreak: parseInt(e.target.value) || 1})}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                             <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveSettings}
                                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <Save size={18} /> Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
