// Header: configura elementos del encabezado que se insertan desde components/header.html.
document.addEventListener('componentsLoaded', function() {
    const header = document.getElementById('header');
    
    // Esto que ya tenías, déjalo
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.12)';
        } else {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
        }
    });

    // ===== ESTO ES LO NUEVO, VA ADENTRO DEL componentsLoaded =====
    const btn = document.getElementById('menuToggle');
    const nav = document.getElementById('navList');

    if (btn && nav) {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            nav.classList.toggle('active');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                btn.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }
});