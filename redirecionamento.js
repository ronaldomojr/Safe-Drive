// redirecionamento.js - Controla o redirecionamento com delay entre páginas

document.addEventListener('DOMContentLoaded', function() {
    setupRedirects();
});

function setupRedirects() {

    const botaoInscrever = document.querySelector('.botlogin');
    if (botaoInscrever && window.location.pathname.includes('cadastro')) {
        botaoInscrever.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithDelay('index.html', 2000, 'Cadastro realizado com sucesso');
        });
    }

    
    const linkCadastro = document.querySelector('.cadastro a');
    if (linkCadastro && window.location.pathname.includes('index')) {
        linkCadastro.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithDelay('cadastro.html', 2000, 'Preparando formulário de cadastro...');
        });
    }

    
    const botaoLogin = document.querySelector('.botlogin');
    if (botaoLogin && window.location.pathname.includes('index') && 
        (botaoLogin.getAttribute('href') === 'p_safedrive.html' || 
         botaoLogin.textContent.toLowerCase().includes('login'))) {
        botaoLogin.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithDelay('p_safedrive.html', 2000, 'Validando credenciais...');
        });
    }
}

function redirectWithDelay(url, delay, message) {
    
    let overlay = document.querySelector('.page-transition');
    if (!overlay) {
        overlay = createLoadingOverlay();
    }

    
    const messageElement = overlay.querySelector('.loading-message');
    if (messageElement) {
        messageElement.textContent = message;
    }

    
    overlay.classList.add('active');
    
    
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('fade-out');
    }

    
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
    
    overlay.classList.add('completing');
    
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}