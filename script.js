document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const keys = {
    messages: "wf_messages",
    notes: "wf_notes",
    relationshipDate: "wf_relationship_date",
    firstVisit: "wf_first_visit",
    lastVisit: "wf_last_visit",
    appStreak: "wf_app_streak",
    youtubeUrl: "wf_youtube_url"
  };

  const todayKey = new Date().toISOString().slice(0, 10);

  function toast(text) {
    let node = $(".toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "toast";
      node.setAttribute("role", "status");
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.classList.add("show");
    window.setTimeout(() => node.classList.remove("show"), 1600);
  }

  function openTab(tabName) {
    $$(".option-item").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabName);
    });
    $$(".panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === tabName);
    });
  }

  $$("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => openTab(button.dataset.tab));
  });

  function daysBetween(start, end) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    return Math.max(0, Math.floor((endDate - startDate) / 86400000));
  }

  function formatRelationship(dateValue) {
    if (!dateValue) return "Configura la fecha";
    const days = daysBetween(dateValue, todayKey);
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const restDays = (days % 365) % 30;

    if (years > 0) return `${years} año${years === 1 ? "" : "s"}, ${months} mes${months === 1 ? "" : "es"}`;
    if (months > 0) return `${months} mes${months === 1 ? "" : "es"}, ${restDays} dia${restDays === 1 ? "" : "s"}`;
    return `${days} dia${days === 1 ? "" : "s"}`;
  }

  function updateAppStreak() {
    if (!localStorage.getItem(keys.firstVisit)) {
      localStorage.setItem(keys.firstVisit, todayKey);
    }

    const lastVisit = localStorage.getItem(keys.lastVisit);
    let streak = Number(localStorage.getItem(keys.appStreak) || "1");

    if (lastVisit && lastVisit !== todayKey) {
      const gap = daysBetween(lastVisit, todayKey);
      streak = gap === 1 ? streak + 1 : 1;
    }

    localStorage.setItem(keys.lastVisit, todayKey);
    localStorage.setItem(keys.appStreak, String(streak));
    $("#appStreak").textContent = `${streak} dia${streak === 1 ? "" : "s"}`;
    $("#lastVisit").textContent = lastVisit && lastVisit !== todayKey ? "Hoy de nuevo" : "Hoy";
  }

  const dateInput = $("#relationshipDate");
  const savedDate = localStorage.getItem(keys.relationshipDate);
  if (savedDate) dateInput.value = savedDate;
  $("#relationshipTime").textContent = formatRelationship(savedDate);
  updateAppStreak();

  function saveRelationshipDate() {
    if (!dateInput.value) {
      toast("Elige una fecha primero");
      return;
    }
    localStorage.setItem(keys.relationshipDate, dateInput.value);
    $("#relationshipTime").textContent = formatRelationship(dateInput.value);
  }

  dateInput.addEventListener("change", saveRelationshipDate);

  $("#saveDate").addEventListener("click", () => {
    saveRelationshipDate();
    toast("Fecha guardada");
  });

  let messages = JSON.parse(localStorage.getItem(keys.messages) || "[]");
  if (messages.length === 0) {
    messages = [
      { text: "Sala lista para pruebas. Todavia no es online en tiempo real.", type: "system" },
      { text: "Hola, ya estoy aqui. Que hacemos primero?", you: false }
    ];
  }

  function saveMessages() {
    localStorage.setItem(keys.messages, JSON.stringify(messages));
  }

  function renderMessages() {
    const messagesEl = $("#messages");
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

  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    const text = input.value.trim();
    if (!text) return;
    messages.push({ text, you: true });
    saveMessages();
    input.value = "";
    renderMessages();
  });

  $("#clearChat").addEventListener("click", () => {
    messages = [{ text: "Chat limpio para una nueva prueba.", type: "system" }];
    saveMessages();
    renderMessages();
  });

  function getYoutubeId(value) {
    if (!value) return null;

    try {
      const url = new URL(value.trim());
      const host = url.hostname.replace("www.", "");

      if (host === "youtu.be") {
        return url.pathname.split("/").filter(Boolean)[0] || null;
      }

      if (host === "youtube.com" || host === "m.youtube.com") {
        if (url.pathname === "/watch") return url.searchParams.get("v");
        if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
        if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null;
      }
    } catch {
      return null;
    }

    return null;
  }

  function loadYoutubeVideo(url) {
    const id = getYoutubeId(url);
    const frame = $("#videoFrame");

    if (!id) {
      $("#watchStatus").textContent = "Link no valido";
      toast("Pega un link valido de YouTube");
      return;
    }

    localStorage.setItem(keys.youtubeUrl, url);
    frame.classList.remove("empty");
    frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}" title="Video de YouTube compartido" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    $("#watchStatus").textContent = "Video listo";
  }

  const savedYoutubeUrl = localStorage.getItem(keys.youtubeUrl);
  if (savedYoutubeUrl) {
    $("#youtubeUrl").value = savedYoutubeUrl;
    loadYoutubeVideo(savedYoutubeUrl);
  }

  $("#loadVideo").addEventListener("click", () => {
    loadYoutubeVideo($("#youtubeUrl").value);
  });

  const cells = $$(".cell");
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

  function getWinner() {
    for (const [a, b, c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return board.every(Boolean) ? "draw" : null;
  }

  function updateGameStatus() {
    if (winner === "draw") $("#gameStatus").textContent = "Empate";
    else if (winner) $("#gameStatus").textContent = `${winner} gana`;
    else $("#gameStatus").textContent = `Turno: ${current}`;
  }

  function resetGame() {
    board = Array(9).fill("");
    current = "X";
    winner = null;
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.disabled = false;
    });
    updateGameStatus();
  }

  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      const index = Number(cell.dataset.index);
      if (board[index] || winner) return;
      board[index] = current;
      cell.textContent = current;
      winner = getWinner();
      if (winner) cells.forEach((item) => { item.disabled = true; });
      else current = current === "X" ? "O" : "X";
      updateGameStatus();
    });
  });

  $("#resetGame").addEventListener("click", resetGame);
  updateGameStatus();

  const notes = $("#sharedNotes");
  notes.value = localStorage.getItem(keys.notes) || "";
  notes.addEventListener("input", () => {
    $("#noteSaved").textContent = "Sin guardar";
  });
  $("#saveNotes").addEventListener("click", () => {
    localStorage.setItem(keys.notes, notes.value);
    $("#noteSaved").textContent = "Guardado";
    toast("Notas guardadas");
  });
  $("#clearNotes").addEventListener("click", () => {
    notes.value = "";
    localStorage.removeItem(keys.notes);
    $("#noteSaved").textContent = "Sin cambios";
  });

  $("#fileInput").addEventListener("change", () => {
    const file = $("#fileInput").files && $("#fileInput").files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      $("#preview").innerHTML = `<img src="${event.target.result}" alt="Recuerdo cargado">`;
    };
    reader.readAsDataURL(file);
  });

  const ideas = [
    "Responder 5 preguntas sobre el dia",
    "Elegir una cancion para escuchar juntos",
    "Hacer una lista de peliculas",
    "Jugar una partida rapida",
    "Escribir una nota bonita",
    "Planear la proxima visita"
  ];

  $("#shuffleIdea").addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    $("#ideaTitle").textContent = idea;
  });

  $("#copyRoom").addEventListener("click", async () => {
    const code = $("#roomCode").textContent;
    try {
      await navigator.clipboard.writeText(code);
      toast("Codigo copiado");
    } catch {
      toast(code);
    }
  });
});
