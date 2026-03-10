import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ This stores conversation history (memory)
let conversation = [];

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    // ✅ Add user message to memory
    conversation.push({ role: "user", content: question });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: conversation,   // send full chat history
      }),
    });

    const data = await response.json();

    console.log("GROQ RESPONSE:", data);

    const answer = data?.choices?.[0]?.message?.content || "No response from AI";

    // ✅ Save AI reply to memory too
    conversation.push({ role: "assistant", content: answer });

    res.json({ answer });

  } catch (err) {
    console.error("Groq Error:", err);
    res.status(500).json({ error: "Error talking to AI" });
  }
});

// ✅ Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});