import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Set up request parser with high limits for image attachments
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API endpoints FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: Date.now() });
});

// Chat completions endpoint proxying to Gemini
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured. Please add your Gemini API key in the AI Studio Settings panel."
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Determine model mapping
      let geminiModel = "gemini-2.5-flash";
      if (model === "advanced") {
        geminiModel = "gemini-2.5-pro";
      }

      // Convert messages to Gemini SDK 'contents' format
      const contents = messages.map((msg: any) => {
        const parts: any[] = [];

        // Check for attached images/media files in the message
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach((att: any) => {
            if (att.dataUrl && att.type.startsWith("image/")) {
              const base64Match = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
              if (base64Match) {
                parts.push({
                  inlineData: {
                    mimeType: base64Match[1],
                    data: base64Match[2]
                  }
                });
              }
            } else if (att.dataUrl && att.type === "text/plain") {
              const base64Match = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
              if (base64Match) {
                const textContent = Buffer.from(base64Match[2], "base64").toString("utf-8");
                parts.push({
                  text: `[Attached File: ${att.name}]\n${textContent}\n`
                });
              }
            } else {
              // Non-image files or other types are mentioned in text
              parts.push({
                text: `[User attached file of type ${att.type}: ${att.name}]`
              });
            }
          });
        }

        // Add the primary message text content
        parts.push({ text: msg.content || "" });

        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts
        };
      });

      // System instruction defines Jarvis persona
      const systemInstruction = 
        "You are Jarvis, a highly advanced, futuristic AI assistant with exceptional intellect, " +
        "elegance, and precision. You speak clearly and assist with code, content, analysis, and logic. " +
        "Format rich answers with markdown, clean tables, and Latex where applicable. " +
        "You always maintain your unique Jarvis persona: helpful, slightly futuristic, clean, and professional.";

      // Establish Server-Sent Events headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await ai.models.generateContentStream({
        model: geminiModel,
        contents,
        config: {
          systemInstruction,
          temperature: model === "fast" ? 0.95 : model === "advanced" ? 0.4 : 0.7,
        }
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();

    } catch (err: any) {
      console.error("Gemini route error:", err);
      res.status(500).json({ error: err.message || "An unexpected server error occurred." });
    }
  });

  // Export app for serverless deployment platforms like Vercel
  export default app;

  async function startServer() {
    const PORT = 3000;

    // Vite Integration
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Jarvis Server running on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  }

  // Only start the server process if not executing on a serverless platform (Vercel)
  if (!process.env.VERCEL) {
    startServer();
  }
