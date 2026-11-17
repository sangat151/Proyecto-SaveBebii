// Activa los detalles interactivos del hero después de cargar las secciones HTML.
document.addEventListener("componentsLoaded", () => {
  const dog = document.getElementById("heroDog"); // Imagen del perrito que recibe la animación.
  const pawButton = document.getElementById("heroPawButton"); // Control que inicia el saludo.
  const message = document.getElementById("heroDogMessage"); // Texto que acompaña la interacción.
  if (dog && pawButton && message) {
    pawButton.addEventListener("click", () => {
      dog.classList.remove("dog-wave"); // Reinicia la animación para que se pueda repetir.
      void dog.offsetWidth; // Fuerza el navegador a recalcular el estilo antes de reiniciarla.
      dog.classList.add("dog-wave");
      message.textContent = "¡Guau! Gracias por venir a saludarme.";
    });
  }

  const countLabel = document.getElementById("tapitasCount"); // Muestra el total guardado en este dispositivo.
  const amountInput = document.getElementById("tapitasAmount"); // Cantidad que la persona desea registrar.
  const addButton = document.getElementById("tapitasAdd"); // Guarda el aporte demostrativo.
  if (!countLabel || !amountInput || !addButton) return;
  const storageKey = "savebebi-tapitas-demo"; // Clave local: no envía datos a un servidor.
  let count = Number.parseInt(localStorage.getItem(storageKey) || "0", 10);
  if (!Number.isFinite(count) || count < 0) count = 0;
  countLabel.textContent = count.toLocaleString("es-CO");
  addButton.addEventListener("click", () => {
    const amount = Number.parseInt(amountInput.value, 10);
    if (!Number.isInteger(amount) || amount < 1 || amount > 5000) {
      amountInput.setCustomValidity("Escribe una cantidad entre 1 y 5000.");
      amountInput.reportValidity();
      return;
    }
    amountInput.setCustomValidity("");
    count += amount;
    localStorage.setItem(storageKey, String(count)); // Persiste el contador solo en el navegador actual.
    countLabel.textContent = count.toLocaleString("es-CO");
    addButton.textContent = "¡Registrado!";
    window.setTimeout(() => { addButton.textContent = "Registrar aporte"; }, 1600);
  });
});
