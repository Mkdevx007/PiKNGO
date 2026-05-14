import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, X, Bot, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { adminAnalyticsApi } from '../../services/api';
import './AiChatConsole.css';

const AiChatConsole = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello Admin! I am the PikNGo AI Brain. How can I help you optimize your business today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // We'll add this to adminAnalyticsApi or create a new service
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1'}/admin/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ prompt: userMessage }),
            });
            
            const data = await response.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error: " + data.message }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my neural network." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`ai-chat-wrapper ${isOpen ? 'active' : ''}`}>
            {!isOpen && (
                <button className="ai-chat-trigger glass-pill hover-glow" onClick={() => setIsOpen(true)}>
                    <div className="trigger-content">
                        <div className="brain-glow">
                            <Brain size={24} />
                        </div>
                        <div className="trigger-text">
                            <span>AI BRAIN</span>
                            <div className="status-dot"></div>
                        </div>
                    </div>
                </button>
            )}

            {isOpen && (
                <div className="ai-chat-console glass-card elite-border animate-slide-up">
                    <div className="console-header">
                        <div className="header-title">
                            <Brain className="brain-icon-pulse" size={20} />
                            <div className="title-text">
                                <h3>PIKNGO BRAIN</h3>
                                <span>NEURAL INTERFACE // V1.5</span>
                            </div>
                        </div>
                        <button className="btn-close-console" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="console-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-row ${msg.role}`}>
                                <div className="message-icon">
                                    {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="message-bubble">
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message-row assistant">
                                <div className="message-icon">
                                    <Bot size={16} className="animate-pulse" />
                                </div>
                                <div className="message-bubble loading">
                                    <span className="dot-pulse"></span>
                                    <span className="dot-pulse"></span>
                                    <span className="dot-pulse"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="console-input-area">
                        <input 
                            type="text" 
                            placeholder="Ask me anything about your business..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="btn-send-ai" onClick={handleSend} disabled={loading || !input.trim()}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiChatConsole;
