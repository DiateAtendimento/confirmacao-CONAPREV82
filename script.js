// script.js

const API_URL      = 'https://backend-confirmacao-conaprev82.onrender.com';
const confirmBtn   = document.getElementById('confirmBtn');
const cpfInput     = document.getElementById('cpfInput');

// Elementos do modal
const modalOverlay = document.getElementById('modalOverlay');
const modalLottie  = document.getElementById('modalLottie');
const modalText    = document.getElementById('modalText');
const modalClose   = document.getElementById('modalClose');
let lottieAnim;

// Abre o modal com animação Lottie e texto
function showModal(animationDataPath, htmlContent) {
  // Remove animação anterior, se houver
  if (lottieAnim) {
    lottieAnim.destroy();
  }
  // Carrega nova animação via path
  lottieAnim = lottie.loadAnimation({
    container: modalLottie,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: animationDataPath
  });

  modalText.innerHTML = htmlContent;
  modalOverlay.classList.remove('hidden');
}

// Fecha o modal ao clicar em fechar e limpa o CPF
modalClose.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
  cpfInput.value = '';
});

// Extrai o primeiro nome do nome completo
function primeiroNome(nomeCompleto) {
  return nomeCompleto.split(' ')[0];
}

confirmBtn.addEventListener('click', async () => {
  const cpf = cpfInput.value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf)) {
    showModal('animacoes/confirm-error.json', '<p>CPF inválido! Digite 11 números.</p>');
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf })
    });
    const json = await resp.json();

    if (resp.status === 409) {
      const ordinal = json.dia === 'Dia1' ? '1º dia' : '2º dia';
      const nome1   = primeiroNome(json.nome);
      const dupContent = `
        <p>Olá ${nome1}, que bom ver você novamente.</p>
        <p>Você já confirmou sua participação no ${ordinal} do 82ª Reunião do CONAPREV.</p>
        <hr>
        <p><strong>Dados da sua confirmação:</strong></p>
        <p>
          Nome: ${json.nome}<br>
          CPF: ${cpf}<br>
          Nº inscrição: ${json.inscricao}<br>
          Confirmado em: ${json.data} às ${json.hora}
        </p>
      `;
      showModal('animacoes/confirm-duplicate.json', dupContent);
      return;
    }

    if (!resp.ok) {
      const tipo = json.error.includes('não inscrito')
        ? 'Lamentamos muito, mas você não fez sua inscrição para o 82ª Reunião do CONAPREV.'
        : `Olá ${primeiroNome(json.nome || '')}, você não possui número de inscrição.`;
      showModal('animacoes/confirm-error.json', `<p>${tipo}</p>`);
      return;
    }

    // Sucesso na confirmação
    const ordinal = json.dia === 'Dia1' ? '1º dia' : '2º dia';
    const nome1   = primeiroNome(json.nome);
    const successContent = `
      <p>Olá ${nome1}, que bom ver você por aqui,</p>
      <p>no ${ordinal} do 82ª Reunião do CONAPREV.</p>
      <p>Sua participação foi confirmada!</p>
      <hr>
      <p>
        Inscrição: ${json.inscricao}<br>
        Data: ${json.data}<br>
        Hora: ${json.hora}
      </p>
    `;
    showModal('animacoes/confirm-success.json', successContent);

  } catch (err) {
    showModal('animacoes/confirm-error.json', `<p>Erro ao confirmar: ${err.message}</p>`);
  }
});