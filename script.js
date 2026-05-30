document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const storage = {
    messages: "wf_messages",
    notes: "wf_notes",
    mood: "wf_mood",
    startedAt: "wf_started_at"
  };

  if (!localStorage.getItem(storage.startedAt)) {
    localStorage.setItem(storage.startedAt, String(Date.now()));
  }

  const showToast = (text) => {
    let toast = $(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1600);
  };

  const addToastStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .toast {
        position: fixed;
        left: 50%;
        bottom: 24px;
        z-index: 20;
        transform: translate(-50%, 16px);
        min-height: 42px;
        display: grid;
        place-items: center;
        padding: 0 16px;
        border-radius: 8px;
        background: #172026;
        color: #fff;
        box-shadow: 0 16px 40px rgba(23, 32, 38, 0.22);
        opacity: 0;
        pointer-events: none;
        transition: opacity 180ms ease, transform 180ms ease;
      }
      .toast.show {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  };
  addToastStyles();

  $$(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab").forEach((tab) => tab.classList.remove("active"));
      $$(".panel").forEach((panel) => panel.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  const messagesEl = $("#messages");
  const chatForm = $("#chatForm");
  const chatInput = $("#chatInput");
  const clearChat = $("#clearChat");

  let messages = JSON.parse(localStorage.getItem(storage.messages) || "[]");
  if (messages.length === 0) {
    messages = [
      { text: "Sala creada. Empiecen con un mensaje, una nota o una partida.", type: "system", t: Date.now() },
      { text: "Estoy conectado. Que hacemos primero?", you: false, t: Date.now() + 1 }
    ];
  }

  function persistMessages() {
    localStorage.setItem(storage.messages, JSON.stringify(messages));
  }

  function renderMessages() {
    messagesEl.innerHTML = "";
    messages.forEach((message) => {
      const node = document.createElement("div");
      node.className = "message";
      if (message.you) node.classList.add("you");
      if (message.type === "system") node.classList.add("system");
      node.textContent = message.text;
      messagesEl.appendChild(node);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  renderMessages();

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    messages.push({ text, you: true, t: Date.now() });
    persistMessages();
    chatInput.value = "";
    renderMessages();
  });

  clearChat.addEventListener("click", () => {
    messages = [{ text: "Chat limpio. La sala sigue abierta.", type: "system", t: Date.now() }];
    persistMessages();
    renderMessages();
  });

  const cells = $$(".cell");
  const statusEl = $("#gameStatus");
  const resetBtn = $("#resetGame");
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  let board = Array(9).fill("");
  let current = "X";
  let winner = null;

  function checkWinner() {
    for (const [a, b, c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.every(Boolean) ? "draw" : null;
  }

  function updateStatus() {
    if (winner === "draw") statusEl.textContent = "Empate";
    else if (winner) statusEl.textContent = `${winner} gana`;
    else statusEl.textContent = `Turno: ${current}`;
  }

  function resetGame() {
    board = Array(9).fill("");
    current = "X";
    winner = null;
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.disabled = false;
    });
    updateStatus();
  }

  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      const index = Number(cell.dataset.index);
      if (board[index] || winner) return;

      board[index] = current;
      cell.textContent = current;
      winner = checkWinner();

      if (winner) {
        cells.forEach((item) => {
          item.disabled = true;
        });
      } else {
        current = current === "X" ? "O" : "X";
      }

      updateStatus();
    });
  });

  resetBtn.addEventListener("click", resetGame);
  updateStatus();

  const notesEl = $("#sharedNotes");
  const saveNotes = $("#saveNotes");
  const clearNotes = $("#clearNotes");
  const noteSaved = $("#noteSaved");

  notesEl.value = localStorage.getItem(storage.notes) || "";
  notesEl.addEventListener("input", () => {
    noteSaved.textContent = "Sin guardar";
  });

  saveNotes.addEventListener("click", () => {
    localStorage.setItem(storage.notes, notesEl.value);
    noteSaved.textContent = "Guardado";
    showToast("Nota guardada");
  });

  clearNotes.addEventListener("click", () => {
    notesEl.value = "";
    localStorage.removeItem(storage.notes);
    noteSaved.textContent = "Sin cambios";
  });

  const fileInput = $("#fileInput");
  const preview = $("#preview");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      preview.innerHTML = "";
      const img = document.createElement("img");
      img.src = event.target.result;
      img.alt = "Recuerdo cargado";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  const ideas = [
    "Hacer una playlist para la semana",
    "Contar lo mejor del dia en 2 minutos",
    "Elegir una pelicula sin discutir genero",
    "Dibujar algo y mandarlo por foto",
    "Jugar piedra, papel o tijera por chat",
    "Planear una visita futura"
  ];

  $("#shuffleIdea").addEventListener("click", () => {
    const list = $("#ideaList");
    const next = ideas[Math.floor(Math.random() * ideas.length)];
    const item = document.createElement("li");
    item.textContent = next;
    list.prepend(item);
    while (list.children.length > 3) list.lastElementChild.remove();
  });

  $$(".mood").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".mood").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $("#moodOutput").textContent = button.dataset.mood;
      localStorage.setItem(storage.mood, button.dataset.mood);
    });
  });

  const savedMood = localStorage.getItem(storage.mood);
  if (savedMood) {
    const moodButton = $(`.mood[data-mood="${savedMood}"]`);
    if (moodButton) moodButton.click();
  }

  $("#copyRoom").addEventListener("click", async () => {
    const code = $("#roomCode").textContent;
    try {
      await navigator.clipboard.writeText(code);
      showToast("Codigo copiado");
    } catch {
      showToast(code);
    }
  });

  $("#startCall").addEventListener("click", () => {
    showToast("La llamada se puede conectar aqui despues");
  });

  $("#planButton").addEventListener("click", () => {
    $("#planTitle").textContent = "Plan nuevo";
    $("#planDescription").textContent = "Elijan hora, actividad y quien prepara la sorpresa.";
    showToast("Plan actualizado");
  });

  function updateTogetherTime() {
    const startedAt = Number(localStorage.getItem(storage.startedAt));
    const diff = Math.max(0, Date.now() - startedAt);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    $("#togetherTime").textContent = `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  updateTogetherTime();
  window.setInterval(updateTogetherTime, 30000);
});
