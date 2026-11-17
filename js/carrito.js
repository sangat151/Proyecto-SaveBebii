const CLAVE = "savebebi_carrito";
const WHATSAPP = "3116382548"; 
const formato = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
let carrito = [];
try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { carrito = []; }

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (error) { console.warn("No se pudo guardar el carrito", error); }
}
let productosActuales = [];
  async function cargarProductos() {
  const respuesta = await fetch("/api/products");
  const productos = await respuesta.json();
productosActuales = productos.map(p => ({
  id: p._id,
  nombre: p.name,
  descripcion: p.description,
  precio: p.price,
  categoria: p.category,
  imagen: p.image
}));  pintarProductos();
}

function pintarProductos(filtro = "") {
  const grid = document.getElementById("grid");
  const navegacion = document.getElementById("catalogo-categorias");
  if (!grid) return;
  const texto = filtro.trim().toLocaleLowerCase("es");
  const lista = productosActuales.filter(p =>
    (p.nombre + " " + p.descripcion + " " + p.categoria).toLocaleLowerCase("es").includes(texto)
  );

  if (!lista.length) {
    if (navegacion) navegacion.innerHTML = "";
    grid.innerHTML = '<p class="catalogo-sin-resultados">No encontramos productos con esa búsqueda.</p>';
    return;
  }

  const ordenCategorias = ["Collares", "Correas", "Arneses", "Ropa", "Camas", "Juguetes", "Alimentación", "Accesorios"];
  const categorias = ordenCategorias.filter(categoria => lista.some(p => p.categoria === categoria));

  if (navegacion) {
    navegacion.innerHTML = categorias.map(categoria =>
      `<a class="categoria-enlace" href="#categoria-${categoria.toLocaleLowerCase("es")}">${categoria}</a>`
    ).join("");
  }

  grid.innerHTML = categorias.map(categoria => {
    const productosCategoria = lista.filter(p => p.categoria === categoria);
    return `
      <section class="catalogo-categoria" id="categoria-${categoria.toLocaleLowerCase("es")}">
        <h3 class="catalogo-categoria-titulo">${categoria}</h3>
        <div class="grid-productos">
          ${productosCategoria.map(p => `
            <article class="producto">
              <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
              <div class="producto-info">
                <span class="producto-cat">${p.categoria}</span>
                <strong class="producto-nombre">${p.nombre}</strong>
                <span class="producto-desc">${p.descripcion}</span>
                <div class="producto-pie"><span class="producto-precio">${formato.format(p.precio)}</span>
              </div>
              </article>`).join("")}
        </div>
      </section>`;
  }).join("");
}


function pintarCarrito() {
  const items = document.getElementById("items"), pie = document.getElementById("pie");
  const badge = document.getElementById("badge"), conteo = document.getElementById("conteo"), total = document.getElementById("total");
  if (!items || !pie || !badge || !conteo || !total) return;
  const unidades = carrito.reduce((s, i) => s + i.cantidad, 0);
  const precioTotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  badge.textContent = unidades; badge.style.display = unidades ? "flex" : "none";
  conteo.textContent = `${unidades} ${unidades === 1 ? "artículo" : "artículos"}`;
  total.textContent = formato.format(precioTotal);
  if (!carrito.length) {
    items.innerHTML = '<div class="carrito-vacio"><strong>Tu carrito está vacío</strong><span>Agrega productos para comenzar.</span></div>';
    pie.style.display = "none"; return;
  }
  pie.style.display = "flex";
  items.innerHTML = carrito.map(i => `
    <div class="item"><img src="${i.imagen}" alt="">
      <div class="item-info"><div class="item-nombre">${i.nombre}</div>
        <div class="item-precio">${formato.format(i.precio)}</div>
        <div class="item-controles"><div class="cantidad">
          <button type="button" aria-label="Restar" onclick="Carrito.cambiar('${i.id}',-1)">−</button><span>${i.cantidad}</span>
          <button type="button" aria-label="Sumar" onclick="Carrito.cambiar('${i.id}',1)">+</button>
        </div><button class="item-eliminar" type="button" onclick="Carrito.quitar('${i.id}')">Eliminar</button></div>
      </div><div class="item-subtotal">${formato.format(i.precio * i.cantidad)}</div>
    </div>`).join("");
}
const Carrito = {
  agregar(id) {
    const p = productosActuales.find(x => x.id === id); if (!p) return;
    const existe = carrito.find(x => x.id === p.id);
    if (existe) existe.cantidad++; else carrito.push({ ...p, cantidad: 1 });
    guardar(); pintarCarrito(); this.abrir();
  },
  add(nombre, precio) { // Compatibilidad con botones antiguos mientras se actualiza la página.
    const p = productosActuales.find(x => x.nombre.toLowerCase() === String(nombre).toLowerCase());    if (p) return this.agregar(p.id);
    const id = 1000 + carrito.length;
    carrito.push({ id, nombre, precio: Number(precio), imagen: "public/images/perro.png", cantidad: 1 });
    guardar(); pintarCarrito(); this.abrir();
  },
  cambiar(id, delta) {
    const item = carrito.find(x => x.id === id);
     if (!item) return;
    item.cantidad += delta; if (item.cantidad <= 0) return this.quitar(id);
    guardar(); pintarCarrito();
  },
  quitar(id) { carrito = carrito.filter(x => x.id !== id); guardar(); pintarCarrito(); },  vaciar() { if (carrito.length && confirm("¿Quieres vaciar el carrito?")) { carrito = []; guardar(); pintarCarrito(); } },
  abrir() { document.getElementById("panel")?.classList.add("abierto"); document.getElementById("overlay")?.classList.add("abierto"); },
  cerrar() { document.getElementById("panel")?.classList.remove("abierto"); document.getElementById("overlay")?.classList.remove("abierto"); },
  finalizar() {
    if (!carrito.length) return;
    const resumen = carrito.map(i => `${i.cantidad} x ${i.nombre}: ${formato.format(i.precio * i.cantidad)}`).join("\n");
    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const mensaje = encodeURIComponent(`Hola, quiero hacer este pedido en SaveBebi:\n\n${resumen}\n\nTotal: ${formato.format(total)}\n\n¿Me confirman disponibilidad y envío?`);
    if (!WHATSAPP) {
      return;
    }
    window.open(`https://wa.me/${WHATSAPP}?text=${mensaje}`, "_blank", "noopener");
  }
};
window.Carrito = Carrito;
document.addEventListener("componentsLoaded", () => {
  const buscador = document.getElementById("buscador");
  buscador?.addEventListener("input", e => pintarProductos(e.target.value));
  cargarProductos();
pintarCarrito();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") Carrito.cerrar(); });
