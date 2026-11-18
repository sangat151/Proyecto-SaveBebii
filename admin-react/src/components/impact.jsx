
import { useState, useEffect } from 'react'

function Impact() {
  const [perritosAyudados, setPerritosAyudados] = useState(0)
  const [tapitasRecolectadas, setTapitasRecolectadas] = useState(0)
  const [aportes, setAportes] = useState([])
  const [seguimientoAbierto, setSeguimientoAbierto] = useState(false)
  const [cargandoAportes, setCargandoAportes] = useState(false)
  const [error, setError] = useState('')

  // Consultar las cifras públicas de impacto.
  useEffect(() => {
    async function cargarImpacto() {
      try {
        const respuesta = await fetch('/api/impact')

        if (!respuesta.ok) {
          throw new Error('No se pudo consultar el impacto.')
        }

        const datos = await respuesta.json()

        setPerritosAyudados(datos.dogsHelped || 0)
        setTapitasRecolectadas(datos.capsCollected || 0)
      } catch (error) {
        console.error('Error al cargar impacto:', error)
      }
    }

    cargarImpacto()
  }, [])

  // Consultar los aportes cuando se abre el seguimiento.
  useEffect(() => {
    if (!seguimientoAbierto) return

    async function cargarAportes() {
      setCargandoAportes(true)
      setError('')

      try {
        const respuesta = await fetch('/api/donations')

        if (!respuesta.ok) {
          throw new Error('No se pudieron consultar los aportes.')
        }

        const datos = await respuesta.json()
        setAportes(datos.donations || [])
      } catch (error) {
        console.error('Error al cargar aportes:', error)
        setError('No fue posible cargar el seguimiento.')
      } finally {
        setCargandoAportes(false)
      }
    }

    cargarAportes()
  }, [seguimientoAbierto])

  // Formatear la fecha de cada aporte.
  const formatoFecha = fecha => {
    if (!fecha) return 'Fecha no disponible'

    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Mostrar el estado del aporte.
  const formatoEstado = estado => {
    if (estado === 'verificado') return 'Verificado'
    if (estado === 'recibido') return 'Recibido'
    return 'Pendiente'
  }

  return (
    <>
      <section className="impact" id="impact">
        <div className="container">

          <h2 className="section-title">
            Nuestro<span>impacto</span>
          </h2>

          <p
            className="section-sub"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            Más que un emprendimiento, somos una comunidad que quiere cambiar vidas.
          </p>

          <div className="impact-grid tracking-impact-grid">

            <article className="impact-item">
              <span className="number" id="publicDogsHelped">
                {perritosAyudados}
              </span>

              <span className="label">
                Perritos ayudados y confirmados
              </span>

              <span className="impact-art-dog" aria-hidden="true">
                🐶
              </span>
            </article>

            <article className="impact-item">
              <span className="number" id="publicCapsCollected">
                {tapitasRecolectadas.toLocaleString('es-CO')}
              </span>

              <span className="label">
                Tapitas recolectadas y verificadas
              </span>

              <span className="impact-art-caps" aria-hidden="true">
                ♻️
              </span>
            </article>

            <article className="impact-item impact-bin-card">
              <span className="label">
                Así avanza nuestra recolección
              </span>

              <div
                className="recycle-bin"
                aria-label="Ilustración de una caneca de tapitas"
              >
                <div className="bin-lid"></div>

                <div className="bin-body">
                  <span>♻</span>
                  <div className="bin-fill" id="publicBinFill"></div>
                </div>
              </div>

              <small></small>
            </article>

          </div>

          <div className="text-center mt-8">
            <button
              id="viewDonationTracking"
              className="tracking-button"
              type="button"
              onClick={() => setSeguimientoAbierto(true)}
            >
              <i className="fas fa-chart-line"></i>
              Ver seguimiento
            </button>
          </div>

        </div>
      </section>

      {seguimientoAbierto && (
        <div
        className={`tracking-modal ${seguimientoAbierto ? 'is-open' : ''}`}          id="trackingModal"
          aria-hidden="false"
        >
          <div
            className="tracking-backdrop"
            onClick={() => setSeguimientoAbierto(false)}
          ></div>

          <section
            className="tracking-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trackingTitle"
          >
            <button
              className="tracking-close"
              type="button"
              onClick={() => setSeguimientoAbierto(false)}
              aria-label="Cerrar"
            >
              &times;
            </button>

            <span className="section-eyebrow">
              Comunidad SaveBebi
            </span>

            <h2 id="trackingTitle">
              Seguimiento de aportes
            </h2>

            <p className="tracking-description">
              Mira los aportes registrados y el avance que SaveBebi ha confirmado.
            </p>

            <div className="tracking-summary">
              <strong id="trackingTotal">
                {aportes.length}
              </strong>
              <span>aportes registrados</span>
            </div>

            <div className="tracking-list-heading">
              <h3>Huellitas que se suman</h3>
              <span>🐾</span>
            </div>

            <div id="trackingList" className="tracking-list">

              {cargandoAportes && (
                <p>Cargando aportes...</p>
              )}

              {error && (
                <p role="alert">{error}</p>
              )}

              {!cargandoAportes && !error && aportes.length === 0 && (
                <p>
                  Todavía no hay aportes registrados.
                </p>
              )}

              {!cargandoAportes && aportes.map(aporte => (
                <article className="tracking-item" key={aporte.id}>

                  <strong>{aporte.name}</strong>

                  <p>{aporte.type}</p>

                  <p>{aporte.detail}</p>

                  <small>
                    {formatoFecha(aporte.date)}
                  </small>

                  <span className={`tracking-status ${aporte.status}`}>
                    {formatoEstado(aporte.status)}
                  </span>

                </article>
              ))}

            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default Impact
