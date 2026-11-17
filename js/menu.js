// Menú adaptable: abre y cierra la navegación en pantallas pequeñas.
document.addEventListener('componentsLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.getElementById('navList');
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navList.classList.toggle('open');
    });
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navList.classList.remove('open');
        });
    });
});