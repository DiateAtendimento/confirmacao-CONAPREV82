/*

// Janela de confirmação permitida:
// Dia 1 => 12/08/2025 08:30–17:30
// Dia 2 => 13/08/2025 08:30–13:00

const API_URL   = 'https://backend-confirmacao-conaprev82.onrender.com';
const confirmBtn = document.getElementById('confirmBtn');
const cpfInput   = document.getElementById('cpfInput');
const msgDiv     = document.getElementById('msg');

confirmBtn.addEventListener('click', async () => {
  msgDiv.textContent = '';
  msgDiv.style.color = '#fff';
  const cpf = cpfInput.value.replace(/\D/g,'');
  if (!/^\d{11}$/.test(cpf)) {
    msgDiv.textContent = 'CPF inválido! Digite 11 números.';
    return;
  }

  const now     = new Date();
  const dia     = now.getDate(), mes = now.getMonth()+1, ano = now.getFullYear();
  const hh      = now.getHours(), mm = now.getMinutes();
  const minutes = hh*60 + mm;

  let permitido = false;
  let diaEvento = '';

  if (ano === 2025 && mes === 8 && dia === 12) {
    permitido = (minutes >= 510 && minutes <= 1050); // 08:30–17:30
    diaEvento = '12/08/2025';
  } else if (ano === 2025 && mes === 8 && dia === 13) {
    permitido = (minutes >= 510 && minutes <= 780);  // 08:30–13:00
    diaEvento = '13/08/2025';
  }

  if (!permitido) {
    msgDiv.textContent = `Fora do horário permitido para o dia ${diaEvento}.\n` +
                         `Janela de confirmação: ${diaEvento} ` +
                         `${diaEvento==='12/08/2025'?'08:30–17:30':'08:30–13:00'}.`;
    return;
  }

  // Chamada real ao backend
  try {
    const resp = await fetch(`${API_URL}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf })
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || 'Erro inesperado.');

    // Exibe todos os dados vindos do backend
    msgDiv.style.color = '#7ed957';
    msgDiv.innerHTML = 
      `Presença confirmada em <strong>${json.dia}</strong><br>` +
      `Inscrição: <strong>${json.inscricao}</strong><br>` +
      `Nome: <strong>${json.nome}</strong><br>` +
      `${json.data} às ${json.hora}`;
  } catch (err) {
    msgDiv.style.color = '#f44336';
    msgDiv.textContent = err.message;
  }
});


*/

// Janela de confirmação permitida:
// Dia 1 => 12/08/2025 08:30–17:30
// Dia 2 => 13/08/2025 08:30–13:00

const API_URL     = 'https://backend-confirmacao-conaprev82.onrender.com';
const confirmBtn  = document.getElementById('confirmBtn');
const cpfInput    = document.getElementById('cpfInput');
const msgDiv      = document.getElementById('msg');
const testCheckbox = document.getElementById('testMode');

confirmBtn.addEventListener('click', async () => {
  // limpa estado anterior
  msgDiv.textContent = '';
  msgDiv.style.color = '#fff';

  const cpf = cpfInput.value.replace(/\D/g,'');
  if (!/^\d{11}$/.test(cpf)) {
    msgDiv.textContent = 'CPF inválido! Digite 11 números.';
    return;
  }

  // checa janela de horário
  const now     = new Date();
  const dia     = now.getDate(), mes = now.getMonth()+1, ano = now.getFullYear();
  const hh      = now.getHours(), mm = now.getMinutes();
  const minutes = hh*60 + mm;

  let permitido = false;
  let diaEvento = '';

  if (ano === 2025 && mes === 8 && dia === 12) {
    permitido = (minutes >= 510 && minutes <= 1050);
    diaEvento = '12/08/2025';
  } else if (ano === 2025 && mes === 8 && dia === 13) {
    permitido = (minutes >= 510 && minutes <= 780);
    diaEvento = '13/08/2025';
  }

  if (!permitido) {
    msgDiv.textContent = `Fora do horário permitido para o dia ${diaEvento}.\n` +
                         `Janela de confirmação: ${diaEvento} ` +
                         `${diaEvento==='12/08/2025'?'08:30–17:30':'08:30–13:00'}.`;
    return;
  }

  // Se estiver em modo teste, só simula (não chama o backend)
  if (testCheckbox.checked) {
    const horaFormat = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    msgDiv.style.color = '#7ed957';
    msgDiv.innerHTML =
      `**[TESTE]** Presença simulada em <strong>${diaEvento}</strong> às <strong>${horaFormat}</strong>.`;
    return;
  }

  // Senão: chamada real ao backend
  try {
    const resp = await fetch(`${API_URL}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf })
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || 'Erro inesperado.');

    // exibe dados retornados
    msgDiv.style.color = '#7ed957';
    msgDiv.innerHTML =
      `Presença confirmada em <strong>${json.dia}</strong><br>` +
      `Inscrição: <strong>${json.inscricao}</strong><br>` +
      `Nome: <strong>${json.nome}</strong><br>` +
      `${json.data} às ${json.hora}`;
  } catch (err) {
    msgDiv.style.color = '#f44336';
    msgDiv.textContent = err.message;
  }
});
