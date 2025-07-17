// Janela de confirmação permitida:
// Dia 1 => 12/08/2025 08:30–17:30
// Dia 2 => 13/08/2025 08:30–13:00

const confirmBtn = document.getElementById('confirmBtn');
const cpfInput   = document.getElementById('cpfInput');
const msgDiv     = document.getElementById('msg');

confirmBtn.addEventListener('click', () => {
  msgDiv.textContent = '';
  const cpf = cpfInput.value.replace(/\D/g,'');
  if (!/^\d{11}$/.test(cpf)) {
    msgDiv.textContent = 'CPF inválido! Digite 11 números.';
    return;
  }

  const now = new Date();
  const dia = now.getDate(), mes = now.getMonth()+1, ano = now.getFullYear();
  const hh = now.getHours(), mm = now.getMinutes();
  const minutes = hh*60 + mm;

  let permitido = false;
  let diaEvento = '';

  if (ano === 2025 && mes === 8 && dia === 12) {
    // 08:30 => 510 min  | 17:30 => 1050 min
    permitido = (minutes >= 510 && minutes <= 1050);
    diaEvento = '12/08/2025';
  } else if (ano === 2025 && mes === 8 && dia === 13) {
    // 08:30 => 510 | 13:00 => 780
    permitido = (minutes >= 510 && minutes <= 780);
    diaEvento = '13/08/2025';
  }

  if (!permitido) {
    msgDiv.textContent = `Fora do horário permitido para o dia ${diaEvento}.\n` +
                         `Janela de confirmação: ${diaEvento} ` +
                         `${diaEvento==='12/08/2025'?'08:30–17:30':'08:30–13:00'}.`;
    return;
  }

  // Simulação de “sucesso”: aqui chamaríamos o backend para gravar no Sheets
  const horaFormat = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
  msgDiv.style.color = '#7ed957';
  msgDiv.innerHTML = `Presença confirmada em <strong>${diaEvento}</strong> às <strong>${horaFormat}</strong>.`;
});
