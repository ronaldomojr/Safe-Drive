// Header padrão do Safe Drive — alterna o menu no mobile.
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.site-nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
        var aberto = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', aberto);
    });
});
