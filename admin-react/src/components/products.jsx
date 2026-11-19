
import { useEffect, useState } from 'react'

function Products({ onAdd, onOpenCart, cantidadCarrito }) {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Orden en el que se muestran las categorías
  const ordenCategorias = [
    'Collares',
    'Correas',
    'Arneses',
    'Ropa',
    'Camas',
    'Juguetes',
    'Alimentación',
    'Accesorios'
  ]

  // Formato de precios en pesos colombianos
  const formato = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  })

  // Cargar los productos desde el servidor
  useEffect(() => {
    async function cargarProductos() {
      try {
        const respuesta = await fetch('/api/products')

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

  // Filtrar productos según lo que escriba el usuario
  const texto = busqueda.trim().toLocaleLowerCase('es')

  const productosFiltrados = productos.filter(producto =>
    `${producto.name} ${producto.description} ${producto.category}`
      .toLocaleLowerCase('es')
      .includes(texto)
  )

  // Mostrar únicamente las categorías que tengan productos
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

        {/* Buscador y acceso al carrito */}
        <div className="tienda-header-inner">

          <input
            className="tienda-search"
            type="search"
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            value={busqueda}
            onChange={event => setBusqueda(event.target.value)}
          />

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

        {/* Estado de carga */}
        {cargando && (
          <p>Cargando productos...</p>
        )}

        {/* Mensaje de error */}
        {error && (
          <p role="alert">{error}</p>
        )}

        {/* Mensaje cuando no hay resultados */}
        {!cargando && !error && productosFiltrados.length === 0 && (
          <p className="catalogo-sin-resultados">
            No encontramos productos con esa búsqueda.
          </p>
        )}

        {/* Categorías y productos */}
        {!cargando && !error && productosFiltrados.length > 0 && (
          <>
            
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
                            src={producto.image}
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
          </>
        )}

      </div>
    </section>
  )
}

export default Products
