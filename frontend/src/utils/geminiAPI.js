import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const fetchChatbotResponse = async (userMessage) => {
    try {
        console.log("Using API Key:", process.env.REACT_APP_GEMINI_API_KEY);

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: userMessage }] }]
            }
        );

        console.log("Full API Response:", response.data);

        // ✅ Fix: Extract the text response correctly
        const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
        
        return aiResponse;
    } catch (error) {
        console.error("Chatbot Error:", error.response ? error.response.data : error.message);
        return "Error: Unable to connect to AI.";
    }
};
