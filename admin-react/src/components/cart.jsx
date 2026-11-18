
function Cart({
  abierto,
  items,
  onClose,
  onChange,
  onRemove,
  onClear,
  onCheckout
}) {
  // Formato de precios colombianos.
  const formato = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  })

  // Calcula la cantidad total de artículos.
  const unidades = items.reduce(
    (total, item) => total + item.cantidad,
    0
  )

  // Calcula el subtotal del carrito.
  const precioTotal = items.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  )

  return (
    <>
      {/* Fondo oscuro que permite cerrar el carrito. */}
      <div
        className={`carrito-overlay ${abierto ? 'abierto' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral del carrito. */}
      <aside
        className={`carrito-panel ${abierto ? 'abierto' : ''}`}
        aria-label="Carrito de compras"
        aria-modal="true"
        role="dialog"
      >
        <div className="carrito-head">
          <div>
            <strong>Tu carrito</strong>
            <div className="conteo">
              {unidades} {unidades === 1 ? 'artículo' : 'artículos'}
            </div>
          </div>

          <button
            className="carrito-cerrar"
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            &times;
          </button>
        </div>

        {/* Productos agregados al carrito. */}
        <div className="carrito-items">
          {items.length === 0 ? (
            <div className="carrito-vacio">
              <strong>Tu carrito está vacío</strong>
              <span>Agrega productos para comenzar.</span>
            </div>
          ) : (
            items.map(item => (
              <div className="item" key={item.id}>
                <img src={item.imagen} alt={item.nombre} />

                <div className="item-info">
                  <div className="item-nombre">
                    {item.nombre}
                  </div>

                  <div className="item-precio">
                    {formato.format(item.precio)}
                  </div>

                  <div className="item-controles">
                    <div className="cantidad">
                      <button
                        type="button"
                        aria-label="Restar"
                        onClick={() => onChange(item.id, -1)}
                      >
                        −
                      </button>

                      <span>{item.cantidad}</span>

                      <button
                        type="button"
                        aria-label="Sumar"
                        onClick={() => onChange(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="item-eliminar"
                      type="button"
                      onClick={() => onRemove(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="item-subtotal">
                  {formato.format(item.precio * item.cantidad)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total y opciones de compra. */}
        <div
          className="carrito-pie"
          style={{ display: items.length ? 'flex' : 'none' }}
        >
          <div className="fila-total">
            <span className="label">Subtotal</span>
            <strong className="valor">
              {formato.format(precioTotal)}
            </strong>
          </div>

          <p className="nota">
            El envío se confirma al coordinar el pedido.
          </p>

          <button
            className="btn-pagar"
            type="button"
            onClick={onCheckout}
          >
            Finalizar por WhatsApp
          </button>

          <button
            className="btn-vaciar"
            type="button"
            onClick={onClear}
          >
            Vaciar carrito
          </button>
        </div>
      </aside>
    </>
  )
}

export default Cart
