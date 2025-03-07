import React, { useState, useEffect, useRef } from "react";
import { fetchChatbotResponse } from "../../utils/geminiAPI";
import "./Chatbot.css";

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "Hey there! How can I help you today?", type: "bot" }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, type: "user" };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");

        try {
            const botReply = await fetchChatbotResponse(input);
            if (botReply) {
                const botMessage = { text: botReply, type: "bot" };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            }
        } catch (error) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "Error: Unable to connect to AI.", type: "bot" }
            ]);
        }
    };

    return (
        <div className="chatbot-page">
            <div className="chatbot-header">
                <h1>AI Chatbot Assistant</h1>
                <p>Get instant responses and guidance for your recruitment process</p>
            </div>

            <div className="chatbot-container">
                <div className="chatbot-wrapper">
                    <div className="chatbot-box">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
