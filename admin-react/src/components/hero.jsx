
import { useState } from 'react'

function Hero() {
  const [saludando, setSaludando] = useState(false)
  const [mensaje, setMensaje] = useState('Toca mi patita para saludar')

  const saludarPerrito = () => {
    // Reinicia la animación para permitir repetir el saludo.
    setSaludando(false)

    setTimeout(() => {
      setSaludando(true)
    }, 10)

    // Cambia el mensaje cuando el perrito saluda.
    setMensaje('¡Guau! Gracias por venir a saludarme.')

    // Permite volver a activar la animación.
    setTimeout(() => {
      setSaludando(false)
    }, 1000)
  }

  return (
    <section className="hero" id="hero">
      <div className="container">

        <div className="hero-content">
          <span className="hero-kicker">
            <i className="fas fa-heart"></i>
            Pequeñas acciones, grandes cambios
          </span>

          <h1>
            SaveBebi <span className="highlight">con propósito</span>
          </h1>

          <p className="subtitle">
            Accesorios para consentir. Acciones para transformar.
          </p>

          <p>
            Cada compra puede impulsar una comunidad que cuida a los animales
            en situación de calle y promueve iniciativas solidarias para niños
            que luchan contra el cáncer.
          </p>

          <div className="hero-actions">
            <a href="#products" className="btn-primary">
              <i className="fas fa-shopping-cart"></i>
              Conocer productos
            </a>

            <a href="#tapitas" className="btn-secondary">
              Sumarme a las tapitas
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-glow" aria-hidden="true"></div>

          <div className="hero-dog-wrap">
            <img
              id="heroDog"
              className={`hero-dog ${saludando ? 'dog-wave' : ''}`}
              src="/Proyecto-SaveBebii/public/images/perro.png"
              alt="Perrito de SaveBebi listo para saludar"
            />

            <button
              id="heroPawButton"
              className="paw-button"
              type="button"
              onClick={saludarPerrito}
              aria-label="Haz que el perrito salude"
            >
              <i className="fas fa-paw" aria-hidden="true"></i>
              ¡Salúdame!
            </button>

            <p
              id="heroDogMessage"
              className="hero-dog-message"
              aria-live="polite"
            >
              {mensaje}
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero
