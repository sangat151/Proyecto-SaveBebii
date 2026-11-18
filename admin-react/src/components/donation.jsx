
import { useState } from 'react'

function Donation() {
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  const manejarEnvio = async (event) => {
    event.preventDefault()

    const formulario = event.currentTarget
    const datos = new FormData(formulario)

    const aporte = {
      name: datos.get('name').trim(),
      contact: datos.get('contact').trim(),
      type: datos.get('type'),
      detail: datos.get('detail').trim()
    }

    try {
      setEnviando(true)
      setMensaje('Registrando tu aporte...')

      const respuesta = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aporte)
      })

      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(resultado.message || 'No se pudo registrar el aporte.')
      }

      setMensaje('¡Gracias! Tu aporte fue registrado correctamente.')
      formulario.reset()

    } catch (error) {
      setMensaje(error.message || 'Ocurrió un error al registrar tu aporte.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="donacion-section" id="donacion">
      <div className="container donation-layout">

        <div className="donation-intro">
          <span className="section-eyebrow">
            <i className="fas fa-heart"></i> Súmate a la causa
          </span>

          <h2>
            Tu ayuda puede <span>hacer la diferencia</span>
          </h2>

          <p>
            Registra tu intención de apoyar a SaveBebi.
            Puedes aportar tapitas, alimento o tu tiempo como voluntario.
          </p>
        </div>

        <form className="donation-form" onSubmit={manejarEnvio}>
          <h3>Registrar mi aporte</h3>

          <label htmlFor="donorName">Tu nombre</label>
          <input
            id="donorName"
            name="name"
            type="text"
            placeholder="¿Cómo te llamas?"
            minLength={2}
            maxLength={70}
            required
          />

          <label htmlFor="donorContact">
            Correo o teléfono (opcional)
          </label>
          <input
            id="donorContact"
            name="contact"
            type="text"
            placeholder="Para poder contactarte"
            maxLength={100}
          />

          <label htmlFor="donationType">
            ¿Cómo deseas ayudar?
          </label>
          <select id="donationType" name="type" required>
            <option value="">Selecciona un aporte</option>
            <option value="Tapitas plásticas">Tapitas plásticas</option>
            <option value="Alimento para animales">Alimento para animales</option>
            <option value="Voluntariado">Tiempo como voluntario/a</option>
            <option value="Aporte económico (intención)">
              Aporte económico (solo intención)
            </option>
          </select>

          <label htmlFor="donationDetail">Cantidad o detalle</label>
          <input
            id="donationDetail"
            name="detail"
            type="text"
            placeholder="Ej. 100 tapitas, una bolsa de alimento..."
            maxLength={140}
            required
          />

          <button
            className="donation-submit"
            type="submit"
            disabled={enviando}
          >
            <i className="fas fa-hand-holding-heart"></i>{' '}
            {enviando ? 'Registrando...' : 'Registrar mi aporte'}
          </button>

          <p className="donation-feedback" role="status" aria-live="polite">
            {mensaje}
          </p>
        </form>

      </div>
    </section>
  )
}

export default Donation
