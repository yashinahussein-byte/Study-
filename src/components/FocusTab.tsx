
import React, { useState, useEffect, useRef } from 'react';
import { TimerMode, TimerSettings, StreakData } from '../types';
import { Play, Pause, RefreshCcw, Settings, X, Save, Sprout, TreePine, Leaf, Flower2 } from 'lucide-react';

const DEFAULT_SETTINGS: TimerSettings = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15
};

interface Props {
    streak: StreakData;
    onActivity: () => void;
}

export const FocusTab: React.FC<Props> = ({ streak, onActivity }) => {
    // --- Timer Settings State ---
    const [settings, setSettings] = useState<TimerSettings>(() => {
        const saved = localStorage.getItem('timerSettings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editSettings, setEditSettings] = useState<TimerSettings>(settings);

    // --- Timer State ---
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(settings[mode] * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const timerRef = useRef<number | null>(null);

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
    }, [isRunning, mode, settings]);

    const handleTimerComplete = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        
        // Trigger global streak activity if it was a focus session
        if (mode === 'focus') {
             onActivity();
        }

        try {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play();
        } catch (e) { console.log("Audio blocked"); }

        if (window.Notification && Notification.permission === "granted") {
            new Notification(mode === 'focus' ? "Focus session complete!" : "Break is over!");
        } else if (window.Notification && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

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

    const openSettings = () => {
        setIsRunning(false);
        setEditSettings(settings);
        setIsSettingsOpen(true);
    };

    const saveSettings = () => {
        setSettings(editSettings);
        setIsSettingsOpen(false);
        setTimeLeft(editSettings[mode] * 60);
    };

    // --- Streak Garden Logic ---
    const getPlantStage = (count: number) => {
        if (count === 0) return { icon: <div className="w-4 h-4 bg-amber-800 rounded-full mx-auto mt-auto mb-1 opacity-50" />, name: "Dormant Seed", message: "Complete a task to plant your seed!" };
        if (count < 3) return { icon: <Sprout size={64} className="text-green-400 mx-auto mt-auto" />, name: "Sprout", message: "It's growing! Keep it up." };
        if (count < 7) return { icon: <Leaf size={80} className="text-green-500 mx-auto mt-auto" />, name: "Sapling", message: "Looking strong! A full week is close." };
        if (count < 30) return { icon: <TreePine size={100} className="text-green-600 mx-auto mt-auto" />, name: "Young Tree", message: "Amazing dedication!" };
        return { icon: <div className="relative mx-auto mt-auto"><TreePine size={120} className="text-green-700" /><Flower2 size={32} className="text-pink-400 absolute top-2 right-4 animate-bounce" /></div>, name: "Flowering Tree", message: "You are unstoppable!" };
    };

    const plant = getPlantStage(streak.count);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Timer Section */}
            <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
                <button onClick={openSettings} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                    <Settings size={24} />
                </button>

                <div className="flex bg-gray-800/50 p-1.5 rounded-xl mb-10 relative z-10">
                    <button onClick={() => changeMode('focus')} className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all ${mode === 'focus' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>Focus</button>
                    <button onClick={() => changeMode('shortBreak')} className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all ${mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>Short Break</button>
                    <button onClick={() => changeMode('longBreak')} className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all ${mode === 'longBreak' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>Long Break</button>
                </div>

                <div className="text-[140px] sm:text-[180px] leading-none font-mono font-bold tracking-tighter mb-10 relative z-10">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <button onClick={toggleTimer} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-gray-700'} text-white`}>
                        {isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                    </button>
                    <button onClick={resetTimer} className="p-5 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                        <RefreshCcw size={28} />
                    </button>
                </div>
            </div>

            {/* Streak Garden Section */}
            <div className="bg-gradient-to-b from-blue-50 to-green-50 border border-green-100 rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#8B4513]/20 rounded-b-3xl"></div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Your Streak Garden</h3>
                <p className="text-green-700 mb-8 max-w-md mx-auto">
                    Complete assignments, reviews, or focus sessions daily to help your garden grow!
                </p>
                
                <div className="h-48 flex flex-col justify-end relative z-10">
                    {plant.icon}
                </div>
                
                <div className="mt-6">
                    <h4 className="text-xl font-bold text-gray-900">{streak.count} Day Streak</h4>
                    <p className="text-green-600 font-medium">{plant.name} — {plant.message}</p>
                </div>
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
                             <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            <button onClick={saveSettings} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"><Save size={18} /> Save Settings</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
