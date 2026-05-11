document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');

        if (!href || href.length < 2) {
            return;
        }

        var target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

(function highlightActiveNavLink() {
    var currentPath = window.location.pathname.split('/').pop();

    if (!currentPath || currentPath === '/') {
        currentPath = 'index.html';
    }

    document.querySelectorAll('.navbar .nav-link').forEach(function (link) {
        var href = link.getAttribute('href') || '';
        var linkPath = href.split('#')[0];

        if (!linkPath) {
            linkPath = 'index.html';
        }

        if (linkPath === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
})();