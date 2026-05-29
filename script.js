document.addEventListener('DOMContentLoaded', ()=>{
  // Tabs
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'))
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'))
      btn.classList.add('active')
      document.getElementById(btn.dataset.tab).classList.add('active')
    })
  })

  // Chat (local only)
  const chatForm = document.getElementById('chatForm')
  const chatInput = document.getElementById('chatInput')
  const messagesEl = document.getElementById('messages')
  const STORAGE_MSGS = 'wf_messages'
  let messages = JSON.parse(localStorage.getItem(STORAGE_MSGS) || '[]')
  function renderMessages(){
    messagesEl.innerHTML = ''
    messages.forEach(m=>{
      const d = document.createElement('div')
      d.className = 'message' + (m.you? ' you': '')
      d.textContent = m.text
      messagesEl.appendChild(d)
    })
    messagesEl.scrollTop = messagesEl.scrollHeight
  }
  renderMessages()
  chatForm.addEventListener('submit', e=>{
    e.preventDefault()
    const text = chatInput.value.trim()
    if(!text) return
    messages.push({text, you:true, t:Date.now()})
    localStorage.setItem(STORAGE_MSGS, JSON.stringify(messages))
    chatInput.value = ''
    renderMessages()
  })

  // Tic-Tac-Toe
  const cells = Array.from(document.querySelectorAll('.cell'))
  const statusEl = document.getElementById('gameStatus')
  const resetBtn = document.getElementById('resetGame')
  let board = Array(9).fill('')
  let cur = 'X'
  let winner = null
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  function checkWinner(){
    for(const [a,b,c] of wins){
      if(board[a] && board[a]===board[b] && board[a]===board[c]) return board[a]
    }
    return board.every(Boolean)? 'draw': null
  }
  function updateStatus(){
    if(winner==='draw') statusEl.textContent = 'Empate'
    else if(winner) statusEl.textContent = winner + ' gana!'
    else statusEl.textContent = 'Turno: ' + cur
  }
  function resetGame(){
    board.fill('')
    cells.forEach(c=>c.textContent='')
    cur = 'X'
    winner = null
    updateStatus()
  }
  cells.forEach(cell=>{
    cell.addEventListener('click', ()=>{
      const i = Number(cell.dataset.index)
      if(board[i] || winner) return
      board[i]=cur
      cell.textContent = cur
      winner = checkWinner()
      if(!winner) cur = cur==='X'?'O':'X'
      updateStatus()
    })
  })
  resetBtn.addEventListener('click', resetGame)
  updateStatus()

  // Notes (shared via localStorage)
  const notesEl = document.getElementById('sharedNotes')
  const saveNotes = document.getElementById('saveNotes')
  const clearNotes = document.getElementById('clearNotes')
  const NOTES_KEY = 'wf_notes'
  notesEl.value = localStorage.getItem(NOTES_KEY) || ''
  saveNotes.addEventListener('click', ()=>{
    localStorage.setItem(NOTES_KEY, notesEl.value)
    saveNotes.textContent = 'Guardado'
    setTimeout(()=>saveNotes.textContent='Guardar',900)
  })
  clearNotes.addEventListener('click', ()=>{
    notesEl.value = ''
    localStorage.removeItem(NOTES_KEY)
  })

  // Simple media preview
  const fileInput = document.getElementById('fileInput')
  const preview = document.getElementById('preview')
  fileInput.addEventListener('change', ()=>{
    const f = fileInput.files && fileInput.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = e=>{
      preview.innerHTML = ''
      const img = document.createElement('img')
      img.src = e.target.result
      preview.appendChild(img)
    }
    reader.readAsDataURL(f)
  })

})
