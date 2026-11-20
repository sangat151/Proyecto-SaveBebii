
import { useState, useEffect } from 'react'

function Header({ onLogin }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [cuentaAbierta, setCuentaAbierta] = useState(false)

  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('savebebi_user')) || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const actualizarSombra = () => {
      const header = document.getElementById('header')

      if (header) {
        header.style.boxShadow = window.scrollY > 20
          ? '0 4px 30px rgba(0,0,0,0.12)'
          : '0 2px 20px rgba(0,0,0,0.08)'
      }
    }

    window.addEventListener('scroll', actualizarSombra)

    return () => {
      window.removeEventListener('scroll', actualizarSombra)
    }
  }, [])

  const cerrarSesion = () => {
    sessionStorage.removeItem('savebebi_user')
    sessionStorage.removeItem('savebebi_user_token')
    setUsuario(null)
    setCuentaAbierta(false)
    cerrarMenu()
  }

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  return (
    <header className="header" id="header">
      <div className="container">

        <div className="logo">
          <i className="fas fa-paw"></i>
          SaveBebi
        </div>

        <button
          type="button"
          className={`menu-toggle ${menuAbierto ? 'active' : ''}`}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Menú"
          aria-expanded={menuAbierto}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`nav-list ${menuAbierto ? 'active' : ''}`}
          id="navList"
        >
          <a href="#hero" className="active" onClick={cerrarMenu}>
            Inicio
          </a>

          <a href="#products" onClick={cerrarMenu}>
            Productos
          </a>

          <a href="#impact" onClick={cerrarMenu}>
            Impacto
          </a>

          <a href="#nosotros" onClick={cerrarMenu}>
            Nosotros
          </a>

          <a href="#donacion" onClick={cerrarMenu}>
            Donar
          </a>

          <div className="account-container">
            <button
              type="button"
              className="login-btn"
              onClick={() => {
                cerrarMenu()

                if (usuario) {
                  setCuentaAbierta(!cuentaAbierta)
                } else {
                  onLogin()
                }
              }}
            >
            <span style={{ fontSize: '20px' }}>♙</span>              {usuario ? 'Mi cuenta' : 'Iniciar sesión'}
            </button>

            {usuario && cuentaAbierta && (
              <div className="account-menu">
                <strong>{usuario.nombre}</strong>
                <p>{usuario.email}</p>

                <button type="button" onClick={cerrarSesion}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

        </nav>
      </div>
    </header>
  )
}

export default Header
