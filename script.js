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

/**
 * Exibe o modal:
 * @param {string} animationPath ‒ caminho do JSON da Lottie
 * @param {string} htmlContent   ‒ conteúdo HTML (título, texto, etc)
 * @param {object} opts          ‒ { hideClose:boolean, loop:boolean }
 */
function showModal(animationPath, htmlContent, opts = {}) {
  const { hideClose = false, loop = false } = opts;

  // destrói animação anterior
  if (lottieAnim) lottieAnim.destroy();

  // carrega Lottie
  lottieAnim = lottie.loadAnimation({
    container: modalLottie,
    renderer: 'svg',
    loop,
    autoplay: true,
    path: animationPath
  });

  // configura HTML
  modalText.innerHTML = htmlContent;

  // mostra overlay
  modalOverlay.classList.remove('hidden');

  // toggle botão fechar
  if (hideClose) {
    modalOverlay.classList.add('loading');
  } else {
    modalOverlay.classList.remove('loading');
  }
}

// fecha modal e limpa cpf
modalClose.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
  modalOverlay.classList.remove('loading');
  if (lottieAnim) lottieAnim.destroy();
  cpfInput.value = '';
});

// pega o primeiro nome
function primeiroNome(fullName) {
  return fullName.split(' ')[0] || fullName;
}

confirmBtn.addEventListener('click', async () => {
  const cpf = cpfInput.value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf)) {
    return showModal(
      'animacoes/confirm-error.json',
      `<h2>Ops!</h2>
      <p>CPF inválido! Digite 11 números.</p>`
    );
  }

  // mostra loading (loop) e oculta o fechar
  showModal(
    'animacoes/carregando.json',
    `<p>Carregando…</p>`,
    { hideClose: true, loop: true }
  );

  try {
    const resp = await fetch(`${API_URL}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf })
    });
    const json = await resp.json();

    // 1) duplicidade: o backend devolve { message: "Inscrição já confirmada em DD/MM/... às HH:MM." }
    if (json.message) {
      // extrai data e hora da string do backend
      const [,rest] = json.message.split('Inscrição já confirmada em ');
      const [data, horaWithDot] = rest.split(' às ');
      const hora = horaWithDot.replace('.', '');
      const nome1 = primeiroNome(json.nome || '');
      const ordinal = json.dia === 'Dia1' ? '1º dia' : '2º dia';

      const html = `
        <h2>Você já confirmou!</h2>
        <p>Olá ${nome1}, que bom ver você novamente.</p>
        <p>Presença registrada no ${ordinal} dia da 82ª Reunião do CONAPREV.</p>
        <hr>
        <div class="details">
          <p><strong>Nome:</strong> ${json.nome}</p>
          <p><strong>CPF:</strong> ${cpf}</p>
          <p><strong>Data:</strong> ${data}</p>
          <p><strong>Hora:</strong> ${hora}</p>
        </div>
      `;
      return showModal('animacoes/confirm-duplicate.json', html);
    }

    // 2) erro no OK (404 ou 400)
    if (!resp.ok) {
      let msg;
      if (json.error && json.error.includes('não inscrito')) {
        msg = 'Lamentamos muito, mas você não fez sua inscrição para o 82ª Reunião do CONAPREV.';
      } else if (json.error) {
        msg = `Olá ${primeiroNome(json.nome||'')}, você não possui número de inscrição.`;
      } else {
        msg = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
      }
      return showModal(
        'animacoes/confirm-error.json',
        `<h2>Ops!</h2><p>${msg}</p>`
      );
    }

    // 3) sucesso
    const nome1 = primeiroNome(json.nome);
    const ordinal = json.dia === 'Dia1' ? '1º dia' : '2º dia';
    const html = `
      <h2>Confirmação realizada!</h2>
      <p>Olá ${nome1}, que bom ver você por aqui</p>
      <p>no ${ordinal} dia da 82ª Reunião do CONAPREV,</p>
      <p>Sua participação foi confirmada!</p>
      <hr>
      <div class="details">
        <p><strong>Inscrição:</strong> ${json.inscricao}</p>
        <p><strong>Data:</strong> ${json.data}</p>
        <p><strong>Hora:</strong> ${json.hora}</p>
      </div>
    `;
    showModal('animacoes/confirm-success.json', html);

  } catch (e) {
    showModal(
      'animacoes/confirm-error.json',
      `<h2>Ops!</h2><p>Erro ao confirmar: ${e.message}</p>`
    );
  }
});

// Liga tudo
confirmBtn.addEventListener('click', handleConfirm);
