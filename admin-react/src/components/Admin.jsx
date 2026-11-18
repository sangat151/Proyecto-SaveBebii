
import { useState, useEffect } from 'react'
import '../App.css'
import '../../../css/admin.css'

function Admin() {
  const [token, setToken] = useState(
    sessionStorage.getItem('savebebi_admin_token') || ''
  )

  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [sesionActiva, setSesionActiva] = useState(false)
  const [perritos, setPerritos] = useState(0)
  const [tapitas, setTapitas] = useState(0)
  const [aportes, setAportes] = useState([])
  const [cargandoDatos, setCargandoDatos] = useState(false)

  // Comprueba si ya existe una sesión guardada.
  useEffect(() => {
  if (token) {
    setSesionActiva(true)
    cargarDashboard(token)
  }
}, [])

  // Inicia sesión enviando la contraseña al servidor.
  async function iniciarSesion(event) {
    event.preventDefault()
    setCargando(true)
    setMensaje('Verificando...')
    setError(false)

    try {
      const respuesta = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo iniciar sesión.')
      }

      setToken(datos.token)
      sessionStorage.setItem('savebebi_admin_token', datos.token)
      setSesionActiva(true)
      await cargarDashboard(datos.token)    
        setMensaje('')
      setPassword('')
    } catch (err) {
      setMensaje(err.message)
      setError(true)
    } finally {
      setCargando(false)
    }
  }


  // Prepara las solicitudes que necesitan autorización.
   async function api(url, opciones = {}, tokenActual = token) {    const respuesta = await fetch(url, {
      ...opciones,
      headers: {
        ...(opciones.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
     Authorization: `Bearer ${tokenActual}`,        ...(opciones.headers || {})
      }
    })

    const datos = await respuesta.json().catch(() => ({}))

    if (!respuesta.ok) {
      throw new Error(datos.error || 'Ocurrió un error.')
    }

    return datos
  }

  // Consulta las estadísticas y los aportes registrados.
   async function cargarDashboard(tokenNuevo = token) {
     try {
      setCargandoDatos(true)

     const datos = await api('/api/admin/overview', {}, tokenNuevo)
      setPerritos(datos.impact.dogsHelped || 0)
      setTapitas(datos.impact.capsCollected || 0)
      setAportes(datos.donations || [])

    } catch (err) {
      setMensaje(err.message)
      setError(true)
    } finally {
      setCargandoDatos(false)
    }
  }

  // Cierra la sesión de administración.
async function cerrarSesion() {
  try {
    await api('/api/admin/logout', {
      method: 'POST'
    })
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
  }

  sessionStorage.removeItem('savebebi_admin_token')
  setToken('')
  setSesionActiva(false)
  setMensaje('')
}
  
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <a href="/" className="admin-brand">
          <span>🐾</span> SaveBebi <small>ADMIN</small>
        </a>
        <a href="/" className="back-site">Volver a la tienda</a>
      </header>

      <main className="admin-main">
        {!sesionActiva && (
          <section className="admin-login-card">
            <div className="admin-mark">🐾</div>
            <p className="eyebrow">Acceso privado</p>
            <h1>Panel de administración</h1>
            <p>Ingresa con la contraseña privada de SaveBebi.</p>

            <form onSubmit={iniciarSesion}>
              <label htmlFor="adminPassword">
                Contraseña de administradora
              </label>

              <input
                id="adminPassword"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button type="submit" disabled={cargando}>
                {cargando ? 'Verificando...' : 'Entrar al panel'}
              </button>

              <p className={error ? 'error' : ''} role="status">
                {mensaje}
              </p>
            </form>
          </section>
        )}

       
{sesionActiva && (
  <section>
    <div className="dashboard-heading">
      <div>
        <p className="eyebrow">Centro de control</p>
        <h1>¡Hola, administradora!</h1>
        <p>Desde aquí puedes revisar los aportes y actualizar el impacto confirmado.</p>
        <button
  className="logout-button"
  onClick={cerrarSesion}
>
  Cerrar sesión
</button>
      </div>
    </div>

    <div className="admin-stat-grid">
      <article>
        <span>🐶</span>
        <strong>{perritos}</strong>
        <small>Perritos ayudados</small>
      </article>

      <article>
        <span>♻️</span>
        <strong>{tapitas}</strong>
        <small>Tapitas recolectadas</small>
      </article>

      <article>
        <span>💚</span>
        <strong>{aportes.length}</strong>
        <small>Aportes registrados</small>
      </article>
    </div>


<section className="admin-panel">
  <div className="panel-heading">
    <div>
      <h2>Actualizar impacto</h2>
      <p>Solo registra resultados que ya hayas comprobado.</p>
    </div>
  </div>

  <form
    className="impact-form"
    onSubmit={async (event) => {
      event.preventDefault()

      try {
        const datos = await api('/api/admin/impact', {
          method: 'PUT',
          body: JSON.stringify({
            dogsHelped: Number(perritos),
            capsCollected: Number(tapitas)
          })
        })

        setMensaje(datos.message)
        setError(false)
        await cargarDashboard()
      } catch (err) {
        setMensaje(err.message)
        setError(true)
      }
    }}
  >
    <label htmlFor="dogsHelped">Perritos ayudados</label>
    <input
      id="dogsHelped"
      type="number"
      min="0"
      value={perritos}
      onChange={(event) => setPerritos(event.target.value)}
      required
    />

    <label htmlFor="capsCollected">Tapitas recolectadas</label>
    <input
      id="capsCollected"
      type="number"
      min="0"
      value={tapitas}
      onChange={(event) => setTapitas(event.target.value)}
      required
    />

    <button type="submit">Guardar cifras verificadas</button>

    <p className={error ? 'error' : ''} role="status">
      {mensaje}
    </p>
  </form>
</section>


<section className="admin-panel donation-admin-panel">
  <div className="panel-heading">
    <div>
      <h2>Aportes de la comunidad</h2>
      <p>Revisa cada aporte y su estado.</p>
    </div>
  </div>

  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Persona</th>
          <th>Aporte</th>
          <th>Detalle</th>
          <th>Estado</th>
        </tr>
      </thead>

      <tbody>
        {aportes.length > 0 ? (
          aportes.map((aporte) => (
            <tr key={aporte.id}>
              <td>
                <strong>{aporte.name}</strong>
                <small>{aporte.contact}</small>
              </td>
              <td>{aporte.type}</td>
              <td>{aporte.detail}</td>
              <td>
                <select
                  value={aporte.status}
                  onChange={async (event) => {
                    const nuevoEstado = event.target.value

                    try {
                      await api(
                        `/api/admin/donations/${encodeURIComponent(aporte.id)}`,
                        {
                          method: 'PATCH',
                          body: JSON.stringify({ status: nuevoEstado })
                        }
                      )

                      setAportes((anteriores) =>
                        anteriores.map((item) =>
                          item.id === aporte.id
                            ? { ...item, status: nuevoEstado }
                            : item
                        )
                      )
                    } catch (err) {
                      setMensaje(err.message)
                      setError(true)
                    }
                  }}
                  aria-label="Estado del aporte"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="recibido">Recibido</option>
                  <option value="verificado">Verificado</option>
                </select>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">
              Todavía no hay aportes registrados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>

    {cargandoDatos && <p>Cargando estadísticas...</p>}

<section className="admin-panel">
  <h2>Agregar nuevo producto</h2>

  <form
    onSubmit={async (event) => {
      event.preventDefault()

      const formulario = event.currentTarget
      const datosFormulario = new FormData(formulario)

      const nombre = datosFormulario.get('name').trim()
      const precio = Number(datosFormulario.get('price'))
      const imagen = datosFormulario.get('image')

      if (!nombre || !precio || !imagen || !imagen.size) {
        setMensaje('Completa los campos obligatorios.')
        setError(true)
        return
      }

      if (!Number.isFinite(precio) || precio <= 0) {
        setMensaje('El precio debe ser mayor que cero.')
        setError(true)
        return
      }

      try {
        const datos = await api('/api/admin/products', {
          method: 'POST',
          body: datosFormulario
        })

        setMensaje(datos.message || 'Producto agregado correctamente.')
        setError(false)
        formulario.reset()
      } catch (err) {
        setMensaje(err.message)
        setError(true)
      }
    }}
  >
    <label htmlFor="productName">Nombre del producto</label>
    <input id="productName" name="name" type="text" required />

    <label htmlFor="productPrice">Precio del producto</label>
    <input id="productPrice" name="price" type="number" min="1" required />

    <label htmlFor="productDescription">Descripción</label>
    <textarea id="productDescription" name="description" />

    <label htmlFor="productCategory">Categoría</label>
    <select id="productCategory" name="category" required>
      <option value="">Selecciona una categoría</option>
      <option value="Ropa">Ropa</option>
      <option value="Camas">Camas</option>
      <option value="Correas">Correas</option>
      <option value="Collares">Collares</option>
    </select>

    <label htmlFor="productImage">Imagen del producto</label>
    <input
      id="productImage"
      name="image"
      type="file"
      accept="image/*"
      required
    />

    <button type="submit">Agregar producto</button>

    <p className={error ? 'error' : ''} role="status">
      {mensaje}
    </p>
  </form>
</section>

  </section>
)}

      </main>
    </div>
  )
}

export default Admin
