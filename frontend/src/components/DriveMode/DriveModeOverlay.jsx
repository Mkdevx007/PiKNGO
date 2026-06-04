import React, { useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, Navigation, Search, X, Volume2, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DriveModeOverlay.css';

const DriveModeOverlay = ({ onClose, onSearch, orderStatus }) => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [statusMessage, setStatusMessage] = useState('Awaiting voice command...');
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
    }

    const startListening = () => {
        if (!recognition) {
            setStatusMessage('Speech recognition not supported in this browser.');
            return;
        }
        setIsListening(true);
        setTranscript('');
        setStatusMessage('Listening for commands...');
        recognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
        recognition?.stop();
    };

    const speak = (text) => {
        // Clear any ongoing or queued browser speech instantly to eliminate voice delay!
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    };

    const handleCommand = useCallback((command) => {
        const cmd = command.toLowerCase();
        setIsProcessing(true);
        
        if (cmd.includes('order') || cmd.includes('status')) {
            setStatusMessage('Opening order tracking station...');
            speak('Redirecting you to the order tracking deck.');
            
            // Give 2 seconds for voice prompt to speak, then navigate and close!
            setTimeout(() => {
                onClose();
                navigate('/orders');
            }, 2000);
        } else if (cmd.includes('find') || cmd.includes('restaurant') || cmd.includes('near')) {
            setStatusMessage('Scanning NH-44 for elite eateries nearby...');
            speak('Initiating live GPS scan for nearby dining hubs.');
            onSearch();
            
            // Give 2.5 seconds to scan, then close the overlay to reveal the loaded map!
            setTimeout(() => {
                onClose();
            }, 2500);
        } else if (cmd.includes('close') || cmd.includes('exit')) {
            onClose();
        } else {
            setStatusMessage("I didn't catch that. Try 'Check order status' or 'Find restaurants'.");
            speak("Sorry, I didn't quite catch that. Could you repeat?");
            setTimeout(() => setIsProcessing(false), 2000);
        }
    }, [onSearch, onClose, navigate]);

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            handleCommand(currentTranscript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            
            if (event.error === 'no-speech') {
                setStatusMessage('No speech detected. Try speaking clearly or click below.');
                speak('No speech detected. Please speak clearly, or tap a command below.');
            } else if (event.error === 'not-allowed') {
                setStatusMessage('Microphone access is blocked. Enable permission in settings.');
                speak('Microphone access is blocked. Please allow browser mic permission.');
            } else if (event.error === 'network') {
                setStatusMessage('Slow network. Awaiting command via quick pills below.');
                speak('Speech recognition network error. Try tapping the buttons below.');
            } else {
                setStatusMessage('Microphone error. Tap a quick command below.');
                speak('Sorry, microphone error. Please try clicking the commands below.');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    }, [recognition, handleCommand]);

    return (
        <div className="drive-mode-container animate-fade-in">
            <div className="drive-mode-overlay glass-modern">
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="drive-mode-header">
                    <div className="hud-label">ELITE HUD: DRIVE MODE ACTIVE</div>
                    <div className="safety-warning">Safety first: Focus on the road.</div>
                </div>

                <div className="voice-visualizer">
                    <div className={`pulse-ring ${isListening ? 'active' : ''}`}></div>
                    <div className={`pulse-ring-outer ${isListening ? 'active' : ''}`}></div>
                    <button 
                        className={`mic-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
                        onClick={isListening ? stopListening : startListening}
                    >
                        {isListening ? <Mic size={48} /> : <MicOff size={48} />}
                    </button>
                </div>

                <div className="transcript-display">
                    <p className="status-text">{statusMessage}</p>
                    {transcript && <p className="user-text">"{transcript}"</p>}
                </div>

                <div className="drive-mode-footer">
                    <div className="command-hints">
                        <span>Try saying or tap to execute:</span>
                        <button 
                            className="hint-pill clickable-pill"
                            onClick={() => {
                                setTranscript("Check my order status");
                                handleCommand("Check my order status");
                            }}
                        >
                            "Check my order status"
                        </button>
                        <button 
                            className="hint-pill clickable-pill"
                            onClick={() => {
                                setTranscript("Find restaurants near me");
                                handleCommand("Find restaurants near me");
                            }}
                        >
                            "Find restaurants near me"
                        </button>
                    </div>
                </div>

                {/* HUD Elements */}
                <div className="hud-decoration left">
                    <Navigation size={12} className="animate-pulse" />
                    <div className="hud-line"></div>
                </div>
                <div className="hud-decoration right">
                    <div className="hud-line"></div>
                    <ShieldCheck size={12} className="animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default DriveModeOverlay;
