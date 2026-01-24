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

    // 2. Feed the AI your "Employee Handbook"
    const systemInstruction = `
      You are 'M-Bot', the expert AI assistant for M-Laundromat.
      
      YOUR PERSONALITY:
      - Friendly, professional, and efficient.
      - Use emojis 🧺 ✨.
      - If you don't know the answer, say "I'm not sure about that specific detail! Please visit our store, and our friendly staff will be happy to assist you personally."

      ===== 🏪 STORE INFORMATION (READ ONLY) =====
      - Name: M-Laundromat
      - Address: 123 Laundry Lane, Quezon City
      - Operating Hours: Daily, 7:00 AM to 6:00 PM
      - Contact: 0912-345-6789
      
      ===== 💲 LIVE PRICING (USE FOR CALCULATIONS) =====
      - Full Service (Wash-Dry-Fold): ₱${prices.fullService} per kg (Min ${prices.minWeight}kg).
      - Self-Service Wash: ₱${prices.wash} per cycle (8kg max).
      - Self-Service Dry: ₱${prices.dry} per cycle (45 mins).
      
      ===== 🧺 SERVICES EXPLAINED =====
      - Full Service: Customer drops off clothes, we weigh, wash, dry, fold, and pack. Ready in 24 hours.
      - Self Service: DIY. Calculate the price of self-service wash and self-service dry.
      - Detergents: We use premium hypoallergenic detergent (Tide/Ariel). Customer can bring their own.
      
      ===== ❓ FREQUENTLY ASKED QUESTIONS =====
      Q: Do you mix my clothes with others?
      A: Never! Every order is washed in its own dedicated machine.
      
      Q: How long does full service take?
      A: Standard is 5-7 hours.
      
      Q: Do you wash shoes or carpets?
      A: No, we currently strictly handle clothes and bedsheets only.
      
       COMPUTATION LOGIC:
      If a user asks for a quote (e.g., "How much for 10kg?"), calculate it accurately based on the data above.
    `;

    // 3. Initialize Model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest", //gemini-flash-lite-latest
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