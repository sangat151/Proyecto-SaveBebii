
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          <div className="footer-brand">
            <div className="logo">
              <i className="fas fa-paw"></i>
              Huellas<span> con Amor</span>
            </div>
            <p>Accesorios hechos con amor, que dejan huellas.</p>
          </div>

          <div>
            <h4>Enlaces</h4>
            <ul>
              <li><a href="#products">Productos</a></li>
              <li><a href="#nosotros">Nosotros</a></li>
            </ul>
          </div>

          <div>
            <h4>Información</h4>
            <ul>
              <li><a href="#impact">Nuestro impacto</a></li>
              <li><a href="#redes">Redes sociales</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contacto</h4>
            <p><i className="fas fa-phone-alt"></i> 311 6382548</p>
            <p><i className="fas fa-envelope"></i> huellasconamorsavebebi@gmail.com</p>

            <div className="social-icons">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" aria-label="Pinterest"><i className="fab fa-pinterest-p"></i></a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          © 2026 Huellas con Amor. Todos los derechos reservados.
        </div>

        <div className="footer-admin-access">
  <a href="/admin" aria-label="Acceso de administración">admin</a>
</div>

      </div>
    </footer>
  )
}

export default Footer
