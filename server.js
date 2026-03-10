import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Root route (for browser test)
app.get("/", (req, res) => {
  res.send("GenAI Backend is running 🚀");
});

// Conversation memory
let conversation = [];

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    conversation.push({ role: "user", content: question });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: conversation,
      }),
    });

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content || "No response from AI";

    conversation.push({ role: "assistant", content: answer });

    res.json({ answer });

  } catch (err) {
    console.error("Groq Error:", err);
    res.status(500).json({ error: "Error talking to AI" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});