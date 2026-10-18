# Asisten AI

Website AI chat responsif untuk HP dan laptop, dengan fitur:
- Tanya jawab dengan AI
- Mode rangkuman tugas
- Tema gelap
- Riwayat percakapan selama halaman terbuka
- Desain responsif dan menu samping untuk perangkat seluler

## Persyaratan
- Node.js 18 atau lebih baru
- API key OpenAI (untuk jawaban AI sungguhan). Penggunaan API dapat dikenai biaya sesuai akun dan model.

## Cara menjalankan di komputer

1. Ekstrak ZIP ini.
2. Buka folder `asisten-ai` lewat Terminal/Command Prompt.
3. Pasang dependensi:

   ```bash
   npm install
   ```

4. Salin `.env.example` menjadi `.env`.
   - Windows Command Prompt: `copy .env.example .env`
   - macOS/Linux: `cp .env.example .env`
5. Buka `.env`, lalu isi `OPENAI_API_KEY` dengan API key milikmu. Biarkan `OPENAI_MODEL=gpt-4.1-mini` atau ganti dengan model yang tersedia di akunmu.
6. Jalankan:

   ```bash
   npm start
   ```

7. Buka `http://localhost:3000` di browser.

## Keamanan API key
- API key disimpan di `.env` pada server, bukan di browser.
- Jangan unggah `.env` ke GitHub atau membagikan API key.
- `.gitignore` sudah mengabaikan `.env`.

## Deploy ke hosting
Deploy ke layanan yang mendukung aplikasi Node.js (misalnya server Node atau platform hosting aplikasi). Atur environment variables `OPENAI_API_KEY` dan opsional `OPENAI_MODEL`, lalu jalankan `npm start`. Jangan menggunakan hosting statis saja, karena endpoint `/api/chat` memerlukan server.

## Catatan
- Ini adalah implementasi dasar yang bisa dikembangkan lebih lanjut.
- Chat saat ini tersimpan di memori browser selama halaman terbuka; belum ada akun pengguna atau database.
- Endpoint dasar belum memiliki autentikasi, pembatasan laju, atau moderasi khusus produksi. Tambahkan pengamanan tersebut sebelum membuka website ke publik.
