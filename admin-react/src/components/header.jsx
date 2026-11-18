
import { useState, useEffect } from 'react'

function Header() {

  // Controla si el menú móvil está abierto o cerrado.
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Agrega el efecto de sombra cuando el usuario baja por la página.
  useEffect(() => {
    const actualizarSombra = () => {
      const header = document.getElementById('header')

      if (header) {
        if (window.scrollY > 20) {
          header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.12)'
        } else {
          header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)'
        }
      }
    }

    window.addEventListener('scroll', actualizarSombra)

    // Limpia el evento cuando el componente se desmonta.
    return () => {
      window.removeEventListener('scroll', actualizarSombra)
    }
  }, [])

  // Cierra el menú después de seleccionar un enlace.
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

          <a
            href="/components/sections/Login/login.html"
            className="login-btn"
            onClick={cerrarMenu}
          >
            <i className="fas fa-sign-in-alt"></i>{' '}
            Iniciar sesión
          </a>

        </nav>

      </div>

    </header>
  )
}

export default Header
