const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const Setting = require("../models/Setting"); 

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
  const { message, history } = req.body;

  try {
    // ✅ ADD THIS CHECK: Debugging
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ ERROR: GEMINI_API_KEY is missing in .env file");
      return res.status(500).json({ message: "Server API Key configuration error." });
    }

    // ✅ INITIALIZE HERE INSTEAD
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 1. Fetch Pricing
    const settings = await Setting.findOne();
    const prices = {
      fullService: settings?.fullServicePerKg || 0,
      minWeight: settings?.minWeight || 0,
      wash: settings?.selfServiceWash || 0,
      dry: settings?.selfServiceDry || 0
    };

    // 2. Construct System Instruction
    const systemInstruction = `
      You are 'M Bot', the helpful AI assistant for M Laundromat.
      
      YOUR RULES:
      1. You ONLY answer questions about laundry, stain removal, and order computations.
      2. If asked about anything else, politely decline.
      3. Be friendly, concise, and use emojis.
      
      CURRENT PRICING DATA:
      - Full Service (Drop-off): ₱${prices.fullService} per kg (Min ${prices.minWeight}kg).
      - Self-Service Wash: ₱${prices.wash} per cycle.
      - Self-Service Dry: ₱${prices.dry} per cycle.
      
      COMPUTATION LOGIC:
      If a user asks for a quote (e.g., "How much for 10kg?"), calculate it accurately based on the data above.
    `;

    // 3. Initialize Model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });

    // ============================================================
    // ✅ FIX ADDED HERE: Sanitize History
    // ============================================================
    // Gemini requires the FIRST message in 'history' to be from 'user'.
    // If the frontend sent the "Welcome Message" (role: model) first, we remove it.
    let validHistory = history || [];
    
    if (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift(); // Remove the first element (the welcome message)
    }
    // ============================================================

    // 4. Start Chat Session with VALID history
    const chat = model.startChat({
      history: validHistory, 
    });

    // 5. Send Message
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // 6. Telegram Log
    sendToTelegram(message, aiResponse);

    // 7. Response
    res.status(200).json({ reply: aiResponse });

  } catch (error) {
    console.error("Gemini Error:", error);
    // Send a real error message to the frontend so you know what happened
    res.status(500).json({ 
        message: "M Bot encountered an error.", 
        error: error.message 
    });
  }
};

// Helper: Send to Telegram
const sendToTelegram = (userMsg, aiMsg) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) return;

  const text = `🤖 **New Chat Log**\n\n👤 **User:** ${userMsg}\n💬 **M Bot:** ${aiMsg}`;

  axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown"
  }).catch(err => console.error("Telegram Log Failed:", err.message));
};