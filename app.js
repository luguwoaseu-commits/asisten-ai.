const $ = (selector) => document.querySelector(selector);
const messagesEl = $("#messages");
const welcomeEl = $("#welcome");
const input = $("#promptInput");
const form = $("#chatForm");
const sendButton = $("#sendButton");
const modeHint = $("#modeHint");
const topTitle = $("#topTitle");
const sidebar = $("#sidebar");
const overlay = $("#overlay");

let mode = "chat";
let history = [];
let busy = false;

function setMode(nextMode) {
  mode = nextMode;
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.mode === mode);
  });
  topTitle.textContent = mode === "summary" ? "Rangkuman tugas" : "Tanya AI";
  modeHint.innerHTML = mode === "summary"
    ? '<span>✦</span> Tempel teks tugasmu, lalu minta AI merangkumnya.'
    : '<span>✦</span> Tanya apa pun, aku siap membantu.';
  input.placeholder = mode === "summary" ? "Tempel teks tugas yang ingin dirangkum..." : "Ketik pertanyaanmu di sini...";
  closeSidebar();
}
function openSidebar() { sidebar.classList.add("open"); overlay.classList.add("show"); }
function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("show"); }

document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => setMode(item.dataset.mode)));
$("#openSidebar").addEventListener("click", openSidebar);
$("#closeSidebar").addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

function resetChat() {
  history = [];
  messagesEl.innerHTML = "";
  welcomeEl.hidden = false;
  input.value = "";
  input.style.height = "auto";
  input.focus();
  setMode("chat");
}
$("#newChat").addEventListener("click", resetChat);

document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt || "";
    if (prompt.startsWith("Bantu aku membuat rangkuman")) setMode("summary");
    input.value = prompt;
    input.focus();
    resizeInput();
  });
});

function addMessage(role, content, isTyping = false) {
  const wrap = document.createElement("article");
  wrap.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "assistant" ? "✦" : "K";
  const body = document.createElement("div");
  body.className = "message-body";
  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = role === "assistant" ? "Asisten AI" : "Kamu";
  const text = document.createElement("div");
  text.className = "message-content";
  if (isTyping) {
    text.innerHTML = '<div class="typing" aria-label="AI sedang berpikir"><i></i><i></i><i></i></div>';
  } else {
    // Plain text output prevents model responses from being interpreted as HTML.
    text.textContent = content;
  }
  body.append(name, text);
  wrap.append(avatar, body);
  messagesEl.append(wrap);
  return { wrap, text };
}

function scrollToBottom() {
  const conversation = $("#conversation");
  conversation.scrollTop = conversation.scrollHeight;
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}
function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
}
input.addEventListener("input", resizeInput);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content || busy) return;
  busy = true;
  sendButton.disabled = true;
  welcomeEl.hidden = true;
  input.value = "";
  resizeInput();
  history.push({ role: "user", content });
  addMessage("user", content);
  const pending = addMessage("assistant", "", true);
  scrollToBottom();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, mode })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Permintaan gagal. Coba lagi.");
    pending.text.textContent = data.answer;
    history.push({ role: "assistant", content: data.answer });
  } catch (error) {
    pending.text.textContent = `Belum bisa mendapatkan jawaban. ${error.message}`;
    pending.wrap.classList.add("error");
  } finally {
    busy = false;
    sendButton.disabled = false;
    input.focus();
    scrollToBottom();
  }
});

// Tampilkan status konfigurasi API dengan pesan yang mudah dipahami.
fetch("/api/health")
  .then((response) => response.json())
  .then((data) => {
    if (!data.configured) {
      modeHint.innerHTML = '<span>ⓘ</span> Demo siap. Isi API key di file .env agar AI dapat menjawab.';
    }
  })
  .catch(() => {});
