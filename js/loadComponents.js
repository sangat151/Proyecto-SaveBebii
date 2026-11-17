// Cargador modular: inserta los fragmentos HTML y avisa cuando todos están listos.
async function loadComponents() {
    const elements = document.querySelectorAll('[data-include]');
    for (const el of elements) {
        const file = el.getAttribute('data-include');
        try {
            const response = await fetch(file);
            if (response.ok) { el.innerHTML = await response.text(); }
        } catch (error) { console.error('Error cargando ' + file, error); }
    }
    document.dispatchEvent(new Event('componentsLoaded'));
}
document.addEventListener('DOMContentLoaded', loadComponents);