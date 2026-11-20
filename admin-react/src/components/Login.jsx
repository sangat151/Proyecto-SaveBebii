
import { useEffect, useState } from 'react'
import '../../../css/login.css'

function Login() {
  // Controla si se muestra el inicio de sesión o el registro.
  const [modo, setModo] = useState('login')

  // Guarda los mensajes que se muestran al enviar el formulario.
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    document.body.classList.add('login-page')

    return () => {
      document.body.classList.remove('login-page')
    }
  }, [])

  // Cambia entre iniciar sesión y crear una cuenta.
  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setMensaje('')
  }

  // Procesa el envío del formulario.
 

const manejarEnvio = async (event) => {
  event.preventDefault();

  const datos = new FormData(event.currentTarget);
  const formulario = event.currentTarget;

 if (modo === 'login') {
  try {
    setMensaje('Iniciando sesión...');

    const respuesta = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: datos.get('uname'),
        password: datos.get('psw')
      })
    });

      const texto = await respuesta.text();
      console.log('Respuesta del servidor:', texto);
      const resultado = JSON.parse(texto);
    if (!respuesta.ok) {
      throw new Error(resultado.mensaje);
    }

    sessionStorage.setItem('savebebi_user_token', resultado.token);
    sessionStorage.setItem(
      'savebebi_user',
      JSON.stringify(resultado.usuario)
    );

    setMensaje(resultado.mensaje);

    formulario.reset();
    window.location.href = '/';
    console.log('Redirigiendo a la página principal');

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    setMensaje(error.message || 'No se pudo conectar con el servidor.');
  }

  return;
}

  const contrasena = datos.get('psw');
  const confirmarContrasena = datos.get('confirmarPsw');

  if (contrasena !== confirmarContrasena) {
    setMensaje('Las contraseñas no coinciden.');
    return;
  }

  try {
    setMensaje('Creando tu cuenta...');

    const respuesta = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: datos.get('nombre'),
        email: datos.get('email'),
        password: contrasena
      })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje);
      console.log('Inicio de sesión correcto');
      console.log(resultado);
    }

    setMensaje(resultado.mensaje);
    formulario.reset();
  } catch (error) {
    console.error('Error en el registro:', error);
    setMensaje(error.message || 'No se pudo conectar con el servidor.');
  }
};

  return (
    <main>
      <div className="login-wrapper">
        <section className="login-card">

          <div className="login-logo">
            <i className="fas fa-paw" aria-hidden="true"></i>
            SaveBebi
          </div>

          <h2>
            {modo === 'login'
              ? 'Bienvenido de nuevo'
              : 'Crea tu cuenta'}
          </h2>

          <p>
            {modo === 'login'
              ? 'Ingresa a tu cuenta para continuar'
              : 'Regístrate y forma parte de SaveBebi'}
          </p>

          {/* Opciones para cambiar entre los dos formularios. */}
          <div className="form-options">
            <button
              type="button"
              className={modo === 'login' ? 'btn-login' : ''}
              onClick={() => cambiarModo('login')}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className={modo === 'registro' ? 'btn-login' : ''}
              onClick={() => cambiarModo('registro')}
            >
              Registrarme
            </button>
          </div>

          <form onSubmit={manejarEnvio}>

            {/* Campos que aparecen solamente al registrarse. */}
            {modo === 'registro' && (
              <>
              <div className="form-group">
  <label htmlFor="uname">Usuario</label>
  <input
    type="email"
    id="uname"
    name="uname"
    placeholder="Ingresa tu correo electrónico"
    autoComplete="username"
    required
  />
</div>
                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Ingresa tu correo"
                    autoComplete="email"
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
                <label htmlFor="uname">Correo electrónico</label>
<input
  type="email"
  id="uname"
  name="uname"
  placeholder="Ingresa tu correo electrónico"
  autoComplete="email"
  required
/>
       <input
                type="text"
                id="uname"
                name="uname"
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="psw">Contraseña</label>
              <input
                type="password"
                id="psw"
                name="psw"
                placeholder="Ingresa tu contraseña"
                autoComplete={
                  modo === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                minLength={8}
                required
              />
            </div>

            {/* Confirmación de contraseña para el registro. */}
            {modo === 'registro' && (
              <div className="form-group">
                <label htmlFor="confirmarPsw">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmarPsw"
                  name="confirmarPsw"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            )}

            {/* Opción exclusiva del inicio de sesión. */}
            {modo === 'login' && (
              <div className="form-options">
                <label className="remember-me" htmlFor="remember">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                  />
                  <span>Recuérdame</span>
                </label>

                <a href="#recuperar" className="forgot-password">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            <button type="submit" className="btn-login">
              {modo === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
            </button>

            <p role="status" aria-live="polite">
              {mensaje}
            </p>

          </form>
        </section>
      </div>
    </main>
  )
}

export default Login
