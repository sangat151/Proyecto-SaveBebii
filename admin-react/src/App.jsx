
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(response => response.json())
      .then(data => {
        setProductos(data)
        setCargando(false)
      })
      .catch(error => {
        console.error('Error al cargar productos:', error)
        setCargando(false)
      })
  }, [])

  return (
    <section>
      <h1>Administración de SaveBebi</h1>

      {cargando ? (
        <p>Cargando productos...</p>
      ) : (
        <>
          <p>Productos cargados: {productos.length}</p>

          {productos.map(producto => (
            <p key={producto._id}>{producto.name}</p>
          ))}
        </>
      )}
    </section>
  )
}

export default App
