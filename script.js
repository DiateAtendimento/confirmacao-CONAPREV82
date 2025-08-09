// script.js

const API_URL    = 'https://backend-confirmacao-conaprev82.onrender.com';
const confirmBtn = document.getElementById('confirmBtn');
const cpfInput   = document.getElementById('cpfInput');

// Elementos do modal
const modalOverlay = document.getElementById('modalOverlay');
const modalLottie  = document.getElementById('modalLottie');
const modalText    = document.getElementById('modalText');
const modalClose   = document.getElementById('modalClose');
let lottieAnim;

/**
 * Exibe o modal:
 * @param {string} animationPath – caminho do JSON da Lottie
 * @param {string} htmlContent   – conteúdo HTML (título, texto, etc)
 * @param {object} opts          – { hideClose:boolean, loop:boolean }
 */
function showModal(animationPath, htmlContent, opts = {}) {
  const { hideClose = false, loop = false } = opts;

  // destrói animação anterior
  if (lottieAnim) lottieAnim.destroy();

  // carrega Lottie
  lottieAnim = lottie.loadAnimation({
    container: modalLottie,
    renderer:  'svg',
    loop,
    autoplay:  true,
    path:      animationPath
  });

  // nada cai no innerHTML sem sanitização
  modalText.innerHTML = DOMPurify.sanitize(htmlContent);
  
  modalOverlay.classList.remove('hidden');
  // esconde botao fechar se hideClose=true
  modalOverlay.classList.toggle('loading', hideClose);
}

// Fecha o modal e reseta o campo de CPF
modalClose.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
  modalOverlay.classList.remove('loading');
  if (lottieAnim) lottieAnim.destroy();
  cpfInput.value = '';
});

/** Retorna o primeiro nome de um nome completo */
function primeiroNome(fullName) {
  return (fullName.split(' ')[0] || fullName).trim();
}

confirmBtn.addEventListener('click', async () => {
  const cpf = cpfInput.value.replace(/\D/g, '');
  // Validação básica de CPF
  if (!/^\d{11}$/.test(cpf)) {
    return showModal(
      'animacoes/confirm-error.json',
      `<h2>Ops!</h2>
       <p>CPF inválido! Digite 11 números.</p>`
    );
  }

  // Mostra modal de loading
  showModal(
    'animacoes/carregando.json',
    `<p>Carregando…</p>`,
    { hideClose: true, loop: true }
  );

  try {
    const resp = await fetch(`${API_URL}/confirm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cpf })
    });
    const json = await resp.json();

    // 1) Caso de duplicidade (status 409)
    if (json.message) {
      // parseia data e hora da mensagem do backend
      const [, rest]     = json.message.split('Inscrição já confirmada em ');
      const [data, horaWithDot] = rest.split(' às ');
      const hora         = horaWithDot.replace('.', '');
      const nome1        = primeiroNome(json.nome);
      const ordinal      = json.dia === 'Dia1' ? '1º dia' : '2º dia';

      const html = `
        <h2>Olá ${nome1}, você já confirmou!</h2>
        <p>Presença registrada no ${ordinal} da 82ª Reunião do CONAPREV.</p>
        <hr>
        <div class="details">
          <p><strong>Inscrição:</strong> ${json.inscricao}</p>
          <p><strong>Nome:</strong> ${json.nome}</p>
          <p><strong>CPF:</strong> ${cpf}</p>
          <p><strong>Data:</strong> ${data}</p>
          <p><strong>Hora:</strong> ${hora}</p>
        </div>
      `;
      return showModal('animacoes/confirm-duplicate.json', html);
    }

    // 2) Erros de requisição (400 ou 404)
    if (!resp.ok) {
      // 💡 Novo caso: CPF existente porém fora do horário → mensagem amigável com contagem regressiva
      if (json.errorCode === 'FORA_HORARIO_AGUARDE') {
        const nome1 = primeiroNome(json.nome || '');
        const hh = json.iniciaEm?.horas ?? '00';
        const mm = json.iniciaEm?.minutos ?? '00';
        const rotulo = json.labelDia || (json.proximoDia === 'Dia1' ? 'primeiro dia' : 'segundo dia');

        return showModal(
          'animacoes/confirm-wait.json',
          `<h2>Quase lá, ${nome1}!</h2>
           <p>${nome1}, faltam <strong>${hh}h${mm}</strong> para o início do <strong>${rotulo}</strong> do CONAPREV 2025.</p>
           <p>Aguarde que já vamos liberar o sistema para a confirmação da sua presença no Evento! 🚀</p>`
        );
      }

      let msg;
      if (json.error && json.error.includes('não inscrito')) {
        msg = 'Lamentamos, mas você não fez sua inscrição para a 82ª Reunião do CONAPREV.';
      } else if (json.error) {
        // pode vir “Olá X, você não possui número...” ou “Fora do horário permitido.” etc.
        msg = json.error;
      } else if (json.message) {
        msg = json.message;
      } else {
        msg = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
      }
      return showModal(
        'animacoes/confirm-error.json',
        `<h2>Ops!</h2><p>${msg}</p>`
      );
    }

    // 3) Sucesso (status 200)
    const nome1   = primeiroNome(json.nome);
    const ordinal = json.dia === 'Dia1' ? '1º dia' : '2º dia';
    const html    = `
      <h2>Confirmação realizada!</h2>
      <p>Olá ${nome1}, que bom te ver por aqui!</p>
      <p>Sua participação no ${ordinal} da 82ª Reunião do CONAPREV</p>
      <p>está confirmada!</p>
      <hr>
      <div class="details">
        <p><strong>Inscrição:</strong> ${json.inscricao}</p>
        <p><strong>Nome:</strong> ${json.nome}</p>
        <p><strong>Data:</strong> ${json.data}</p>
        <p><strong>Hora:</strong> ${json.hora}</p>
      </div>
    `;
    showModal('animacoes/confirm-success.json', html);

  } catch (e) {
    // 4) Erro de rede ou inesperado
    showModal(
      'animacoes/confirm-error.json',
      `<h2>Ops!</h2><p>Erro ao confirmar: ${e.message}</p>`
    );
  }
});
