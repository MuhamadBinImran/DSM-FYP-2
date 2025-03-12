import axios from "axios";

const BASE_URL = "http://localhost:5000";

export const fetchChatbotResponse = async (userMessage) => {
    try {
        console.log('Sending message to chatbot:', userMessage);

        // Add a timeout to the request
        const response = await axios.post(
            `${BASE_URL}/api/chatbot`,
            { message: userMessage },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
                withCredentials: true
            }
        );

        console.log('Received response from chatbot API');
        console.log('Response structure:', JSON.stringify(response.data, null, 2));

        // Handle different response formats from Gemini API versions
        let responseText = '';
        
        // Gemini 1.0 format
        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            responseText = response.data.candidates[0].content.parts[0].text;
        } 
        // Gemini 2.0 format
        else if (response.data?.contents?.[0]?.parts?.[0]?.text) {
            responseText = response.data.contents[0].parts[0].text;
        }
        // Alternative format
        else if (response.data?.candidates?.[0]?.text) {
            responseText = response.data.candidates[0].text;
        }
        else {
            console.error('Invalid response structure:', response.data);
            
            // Check for error messages in the response
            if (response.data?.error) {
                throw new Error(response.data.error);
            }
            
            throw new Error('Invalid response format from AI service');
        }

        return responseText;
    } catch (error) {
        console.error('Chatbot error:', error);

        // Handle specific error cases
        if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.error || 
                               error.response.data?.details || 
                               error.message;

            switch (status) {
                case 403:
                    throw new Error('Authentication error with AI service. Please try again later.');
                case 429:
                    throw new Error('Too many requests. Please wait a moment and try again.');
                case 404:
                    throw new Error('AI service is currently unavailable. Please try again later.');
                case 400:
                    throw new Error(`Invalid request: ${errorMessage}`);
                default:
                    throw new Error(`AI service error: ${errorMessage}`);
            }
        }

        if (error.request) {
            throw new Error('Network error. Please check your internet connection.');
        }

        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. The AI service is taking too long to respond.');
        }

        // Generic error fallback
        throw new Error(error.message || 'Unable to get a response from the AI. Please try again.');
    }
};
