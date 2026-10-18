import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "API belum disiapkan. Buat file .env dan isi OPENAI_API_KEY."
      });
    }

    const { messages, mode = "chat" } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Pesan belum diisi." });
    }

    const safeMessages = messages
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }));

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "Pesan terakhir harus berasal dari pengguna." });
    }

    const systemPrompt = mode === "summary"
      ? "Kamu adalah Asisten AI yang membantu pelajar membuat rangkuman tugas dalam bahasa Indonesia. Rangkum secara akurat, jelas, terstruktur dengan judul dan poin penting. Jangan mengarang fakta yang tidak ada di teks; sebutkan jika informasi tidak cukup."
      : "Kamu adalah Asisten AI, asisten percakapan yang ramah, jelas, dan membantu. Jawab dalam bahasa yang digunakan pengguna, utamakan bahasa Indonesia. Untuk tugas sekolah, jelaskan langkah dan alasan dengan ringkas agar mudah dipahami. Jangan mengaku tahu hal yang tidak kamu ketahui.";

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
      temperature: 0.7
    });

    const answer = response.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("AI tidak mengembalikan jawaban.");
    res.json({ answer });
  } catch (error) {
    console.error("Chat API error:", error?.message || error);
    if (error?.status === 401) {
      return res.status(401).json({ error: "API key tidak valid. Periksa OPENAI_API_KEY di file .env." });
    }
    if (error?.status === 429) {
      return res.status(429).json({ error: "Batas penggunaan API tercapai atau saldo API tidak mencukupi. Periksa akun penyedia AI." });
    }
    res.status(500).json({ error: "Maaf, terjadi kendala saat menghubungi AI. Coba lagi sebentar." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Asisten AI berjalan di http://localhost:${port}`);
});