// Comportamiento básico y helpers para la página
document.addEventListener('DOMContentLoaded', function () {
  // Rellenar el año en el pie de página
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Punto de entrada para futuras interacciones (menu, carrusel, etc.)
  // Añadir aquí listeners y lógica de UI según se necesite
});
