import React, { useState, useEffect, useRef } from "react";
import { fetchChatbotResponse } from "../../utils/geminiAPI";
import "./Chatbot.css";
import { Send, AlertCircle, RefreshCw } from "lucide-react";

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "Hey there! How can I help you today?", type: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // Focus input when component mounts
        inputRef.current?.focus();
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { text: input, type: "user" };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const botReply = await fetchChatbotResponse(input);
            if (botReply) {
                const botMessage = { text: botReply, type: "bot" };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            }
        } catch (error) {
            console.error("Chatbot Error:", error);
            setError("Error communicating with AI service");
            setMessages((prevMessages) => [
                ...prevMessages,
                { 
                    text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.", 
                    type: "bot",
                    isError: true 
                }
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleRetry = () => {
        setError(null);
        // Remove the last error message
        setMessages(prevMessages => 
            prevMessages.filter((msg, index) => 
                !(index === prevMessages.length - 1 && msg.isError)
            )
        );
    };

    return (
        <div className="chatbot-page">
            <div className="chatbot-header">
                <h1>AI Chatbot Assistant</h1>
                <p>Ask me anything about job searching, resume building, or career advice!</p>
            </div>
            
            <div className="chatbot-container">
                <div className="chatbot-wrapper">
                    <div className="chatbot-box">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.type} ${message.isError ? 'error' : ''}`}
                            >
                                <div className="message-content">
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {error && (
                        <div className="chatbot-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                            <button onClick={handleRetry} className="retry-button">
                                <RefreshCw size={14} />
                                Retry
                            </button>
                        </div>
                    )}
                    
                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                            disabled={isLoading}
                            ref={inputRef}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            className={isLoading ? "loading" : ""}
                            aria-label="Send message"
                        >
                            {isLoading ? "Sending..." : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
