import { useEffect, useRef, useCallback } from 'react';

/**
 * useWakeWord — Background voice listener for wake-word detection.
 * 
 * Continuously listens (in short bursts) for trigger phrases like 
 * "drive mode", "hey pikingo" etc. When detected, fires the onWake callback.
 * 
 * Automatically pauses when `isActive` is true (e.g., Drive Mode is open)
 * to avoid mic conflicts with DriveModeOverlay's own SpeechRecognition.
 * 
 * @param {Object} options
 * @param {Function} options.onWake - Callback fired when wake word is detected
 * @param {boolean} options.isActive - If true, pauses listening (Drive Mode is open)
 * @param {boolean} options.enabled - Master switch to enable/disable the listener
 */
const WAKE_PHRASES = [
    'drive mode',
    'hey pikingo',
    'hey pick and go',
    'open drive mode',
    'start drive mode',
    'activate drive mode',
];

const useWakeWord = ({ onWake, isActive = false, enabled = true }) => {
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const restartTimeoutRef = useRef(null);
    const shouldRunRef = useRef(false);

    const onWakeRef = useRef(onWake);
    onWakeRef.current = onWake;

    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListeningRef.current || !shouldRunRef.current) return;

        try {
            recognitionRef.current.start();
            isListeningRef.current = true;
        } catch (err) {
            // Already started or browser error — retry after delay
            isListeningRef.current = false;
            if (shouldRunRef.current) {
                restartTimeoutRef.current = setTimeout(startListening, 2000);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        isListeningRef.current = false;
        shouldRunRef.current = false;
        clearTimeout(restartTimeoutRef.current);
        try {
            recognitionRef.current?.stop();
        } catch (_) { /* ignore */ }
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition || !enabled) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
            // Check all results (interim + final) for wake words
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                // Check all alternatives
                for (let j = 0; j < result.length; j++) {
                    const transcript = result[j].transcript.toLowerCase().trim();
                    
                    const isWakeWord = WAKE_PHRASES.some(phrase => transcript.includes(phrase));
                    
                    if (isWakeWord) {
                        console.log('[WakeWord] 🎙️ Wake word detected:', transcript);
                        stopListening();
                        onWakeRef.current();
                        return;
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            isListeningRef.current = false;
            
            // Don't retry on permission errors
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                console.warn('[WakeWord] Mic permission denied. Wake word disabled.');
                return;
            }

            // For transient errors (no-speech, network, aborted), restart after delay
            if (shouldRunRef.current) {
                restartTimeoutRef.current = setTimeout(startListening, 1500);
            }
        };

        recognition.onend = () => {
            isListeningRef.current = false;
            // Auto-restart if we should still be running
            if (shouldRunRef.current) {
                restartTimeoutRef.current = setTimeout(startListening, 300);
            }
        };

        return () => {
            shouldRunRef.current = false;
            isListeningRef.current = false;
            clearTimeout(restartTimeoutRef.current);
            try { recognition.stop(); } catch (_) { /* ignore */ }
            recognitionRef.current = null;
        };
    }, [enabled, startListening, stopListening]);

    // Start/stop based on isActive (pause when Drive Mode is open)
    useEffect(() => {
        if (!enabled) return;

        if (isActive) {
            // Drive Mode is open — pause wake word listener
            stopListening();
        } else {
            // Drive Mode is closed — resume listening
            shouldRunRef.current = true;
            // Small delay to let DriveModeOverlay's mic release
            restartTimeoutRef.current = setTimeout(startListening, 1000);
        }

        return () => {
            clearTimeout(restartTimeoutRef.current);
        };
    }, [isActive, enabled, startListening, stopListening]);

    return { isListening: isListeningRef.current };
};

export default useWakeWord;
