'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
// Using window.SpeechRecognition or window.webkitSpeechRecognition
const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export function useAccessibility() {
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);
    useEffect(() => {
        if (SpeechRecognition && !recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const result = event.results[current][0].transcript;
                setTranscript(result.toLowerCase());
            };
            recognition.onend = () => {
                setIsListening(false);
            };
            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
            recognitionRef.current = recognition;
        }
    }, []);
    const toggleVoiceMode = () => {
        setIsVoiceMode(prev => {
            const nextState = !prev;
            if (nextState) {
                speak("Accessibility mode enabled. Keyboard navigation and spoken feedback are now active. Press Spacebar or click the microphone to give a voice command like 'Simulate'.");
            }
            else {
                stopSpeak();
            }
            return nextState;
        });
    };
    const speak = useCallback((text, interrupt = true) => {
        if (typeof window === 'undefined' || !window.speechSynthesis)
            return;
        if (interrupt) {
            window.speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        // Choose a high quality voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Siri'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        window.speechSynthesis.speak(utterance);
    }, []);
    const stopSpeak = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);
    const listen = useCallback(() => {
        if (!recognitionRef.current) {
            speak("Browser does not support voice recognition.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        else {
            setTranscript(''); // Clear previous
            speak("Listening...");
            setTimeout(() => {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                }
                catch (e) {
                    console.error("Recognition already started");
                }
            }, 800); // Wait for "Listening..." to finish speaking
        }
    }, [isListening, speak]);
    const clearTranscript = () => setTranscript('');
    return {
        isVoiceMode,
        toggleVoiceMode,
        speak,
        stopSpeak,
        listen,
        isListening,
        transcript,
        clearTranscript
    };
}
