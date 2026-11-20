
function Nosotros() {
  return (
    <section className="nosotros" id="nosotros">
      <div className="container">

        <div className="nosotros-text">
          <h2>
            Sobre <span>Huellas con Amor</span>
          </h2>

          <p>
            Nació del amor por los animales y el deseo de ayudar.
            Aquí no solo vendemos accesorios, sino que creamos
            oportunidades para generar una mejor vida.
          </p>

          <a href="#donacion" className="btn-primary">
            Donar ahora
          </a>
        </div>

        <div className="nosotros-image">
          <div className="img">
            <img
           src="/Proyecto-SaveBebii/images/ayuda.png" 
              alt="Ayuda de SaveBebi a los animales"
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default Nosotros
