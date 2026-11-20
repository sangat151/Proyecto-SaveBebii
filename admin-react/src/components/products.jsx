
import { useEffect, useState } from 'react'

const API_URL = 'https://savebebi-backend.onrender.com'

function Products({ onAdd, onOpenCart, cantidadCarrito }) {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const ordenCategorias = [
    'Collares',
    'Correas',
    'Arneses',
    'Ropa',
    'Camas',
    'Juguetes',
    'Alimentos',
    'Accesorios'
  ]

  const formato = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  })

  // Convierte la ruta de cada imagen en una dirección de Render.
  const obtenerImagen = (imagen) => {
    if (!imagen) return ''

    if (imagen.startsWith('http')) {
      return imagen
    }

    if (imagen.startsWith('/')) {
      return `${API_URL}${imagen}`
    }

    return `${API_URL}/${imagen}`
  }

  // Consulta los productos directamente al backend de Render.
  useEffect(() => {
    async function cargarProductos() {
      try {
        const respuesta = await fetch(`${API_URL}/api/products`)

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los productos.')
        }

        const datos = await respuesta.json()
        setProductos(datos)
      } catch (error) {
        console.error('Error al cargar productos:', error)
        setError('No fue posible cargar los productos.')
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [])

  const texto = busqueda.trim().toLocaleLowerCase('es')

  const productosFiltrados = productos.filter(producto =>
    `${producto.name} ${producto.description} ${producto.category}`
      .toLocaleLowerCase('es')
      .includes(texto)
  )

  const categorias = ordenCategorias.filter(categoria =>
    productosFiltrados.some(
      producto => producto.category === categoria
    )
  )

  return (
    <section className="products" id="products">
      <div className="container">

        <h2 className="section-title">
          Nuestros <span>productos</span>
        </h2>

        {/* Buscador y carrito */}
        <div className="tienda-header-inner">

          <div className="tienda-search-wrap">
            <svg
              className="tienda-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              className="tienda-search"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              value={busqueda}
              onChange={event => setBusqueda(event.target.value)}
            />
          </div>

          <button
            className="btn-carrito"
            type="button"
            onClick={onOpenCart}
          >
            Carrito

            <span className="carrito-badge">
              {cantidadCarrito}
            </span>
          </button>

        </div>

        {cargando && (
          <p>Cargando productos...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!cargando && !error && productosFiltrados.length === 0 && (
          <p className="catalogo-sin-resultados">
            No encontramos productos con esa búsqueda.
          </p>
        )}

        {!cargando && !error && productosFiltrados.length > 0 && (
          <div className="catalogo-secciones">

            {categorias.map(categoria => {
              const productosCategoria = productosFiltrados.filter(
                producto => producto.category === categoria
              )

              return (
                <section
                  className="catalogo-categoria"
                  id={`categoria-${categoria.toLocaleLowerCase('es')}`}
                  key={categoria}
                >
                  <h3 className="catalogo-categoria-titulo">
                    {categoria}
                  </h3>

                  <div className="grid-productos">

                    {productosCategoria.map(producto => (
                      <article
                        className="producto"
                        key={producto._id}
                      >

                        <img
                          src={obtenerImagen(producto.image)}
                          alt={producto.name}
                          loading="lazy"
                        />

                        <div className="producto-info">

                          <span className="producto-cat">
                            {producto.category}
                          </span>

                          <strong className="producto-nombre">
                            {producto.name}
                          </strong>

                          <span className="producto-desc">
                            {producto.description}
                          </span>

                          <div className="producto-pie">

                            <span className="producto-precio">
                              {formato.format(producto.price)}
                            </span>

                            <button
                              className="btn-primary btn-agregar-carrito"
                              type="button"
                              onClick={() => onAdd(producto)}
                            >
                              Añadir al carrito
                            </button>

                          </div>

                        </div>
                      </article>
                    ))}

                  </div>
                </section>
              )
            })}

          </div>
        )}

      </div>
    </section>
  )
}

export default Products
