// Menu Hamburguer - Safe Drive
// Toggle entre aberto e fechado

const menuToggle = document.querySelector('.menu-toggle');
const navTop = document.querySelector('.nav-top');
const navLinks = document.querySelectorAll('.nav-top a');

// Toggle menu ao clicar no hamburguer
if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        navTop.classList.toggle('ativo');
        
        // Atualizar aria-expanded para acessibilidade
        const isOpen = navTop.classList.contains('ativo');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });
}

// Fechar menu ao clicar em um item
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navTop.classList.remove('ativo');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Fechar menu ao clicar fora (na zona semi-transparente)
document.addEventListener('click', function(event) {
    const clickedInside = navTop.contains(event.target) || menuToggle.contains(event.target);
    
    if (!clickedInside && navTop.classList.contains('ativo')) {
        navTop.classList.remove('ativo');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});
