import api from './api'; // Assuming you have a base axios instance

const chatService = {
  sendMessage: async (message, history) => {
    // History format required by Gemini: [{ role: "user", parts: "..." }, ...]
    const response = await api.post('/chat', { message, history });
    return response.data;
  }
};

export default chatService;