// redirecionamento.js - Controla o redirecionamento com delay entre páginas

document.addEventListener('DOMContentLoaded', function() {
    // Configuração dos redirecionamentos
    setupRedirects();
});

function setupRedirects() {
    // PÁGINA DE CADASTRO - Botão "Inscreva-se"
    const botaoInscrever = document.querySelector('.botlogin');
    if (botaoInscrever && window.location.pathname.includes('cadastro')) {
        botaoInscrever.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithDelay('Telalogin.html', 2000, 'Cadastro realizado com sucesso');
        });
    }

    // PÁGINA DE LOGIN - Link "Cadastre-se"
    const linkCadastro = document.querySelector('.cadastro a');
    if (linkCadastro && window.location.pathname.includes('Telalogin')) {
        linkCadastro.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithDelay('cadastro.html', 2000, 'Preparando formulário de cadastro...');
        });
    }

    // PÁGINA DE LOGIN - Botão "Login" (se existir e for para cadastro)
    const botaoLogin = document.querySelector('.botlogin');
    if (botaoLogin && window.location.pathname.includes('Telalogin') && 
        (botaoLogin.getAttribute('href') === 'cadastro.html' || 
         botaoLogin.textContent.toLowerCase().includes('login'))) {
        botaoLogin.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithDelay('cadastro.html', 2000, 'Validando credenciais...');
        });
    }
}

function redirectWithDelay(url, delay, message) {
    // Cria o overlay de loading se não existir
    let overlay = document.querySelector('.page-transition');
    if (!overlay) {
        overlay = createLoadingOverlay();
    }

    // Atualiza a mensagem
    const messageElement = overlay.querySelector('.loading-message');
    if (messageElement) {
        messageElement.textContent = message;
    }

    // Mostra o overlay
    overlay.classList.add('active');
    
    // Adiciona efeito de fade out na página atual
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('fade-out');
    }

    // Inicia o contador regressivo
    startCountdown(overlay, url, delay);
}

function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h3 class="loading-title">Redirecionando</h3>
            <p class="loading-message">Aguarde enquanto processamos sua solicitação...</p>
            <div class="countdown-container">
                <span class="countdown">2</span> segundos
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function startCountdown(overlay, url, delay) {
    const seconds = delay / 1000;
    let countdown = seconds;
    const countdownElement = overlay.querySelector('.countdown');
    const progressFill = overlay.querySelector('.progress-fill');

    // Animação da barra de progresso
    progressFill.style.animation = `progressFill ${delay}ms linear forwards`;

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            completeRedirect(url, overlay);
        }
    }, 1000);
}

function completeRedirect(url, overlay) {
    // Adiciona efeito final antes do redirecionamento
    overlay.classList.add('completing');
    
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}