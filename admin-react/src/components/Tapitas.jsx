
function Tapitas() {
  return (
    <section className="tapitas-section" id="tapitas">
      <div className="container tapitas-layout">

        <div className="tapitas-art" aria-hidden="true">
          <div className="tapitas-circle">
            <i className="fas fa-recycle"></i>
            <span>
              Una tapita
              <br />
              cuenta
            </span>
          </div>

          <span className="tapita-dot dot-one"></span>
          <span className="tapita-dot dot-two"></span>
          <span className="tapita-dot dot-three"></span>
        </div>

        <div className="tapitas-copy">
          <span className="section-eyebrow">
            Una segunda oportunidad
          </span>

          <h2>
            Juntamos tapitas, <span>sumamos esperanza</span>
          </h2>

          <p>
            Queremos impulsar una campaña de recolección de tapas plásticas
            para apoyar iniciativas solidarias dirigidas a niños con cáncer.
            Las tapas deben entregarse a una fundación o campaña verificable
            que indique cómo se reciben y a qué se destinan.
          </p>

          <div className="tapitas-steps">

            <div>
              <span>01</span>
              <p>
                <strong>Lava y seca</strong>
                <br />
                Las tapitas plásticas limpias.
              </p>
            </div>

            <div>
              <span>02</span>
              <p>
                <strong>Guárdalas</strong>
                <br />
                En una bolsa o recipiente limpio.
              </p>
            </div>

            <div>
              <span>03</span>
              <p>
                <strong>Verifica el punto</strong>
                <br />
                Antes de llevarlas a una campaña aliada.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default Tapitas
