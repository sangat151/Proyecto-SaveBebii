
import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/header'
import Login from './components/Login'
import Products from './components/products'
import Cart from './components/cart'
import Hero from './components/hero'
import Impact from './components/impact'
import Donation from './components/donation'
import Features from './components/features'
import Nosotros from './components/Nosotros'
import Tapitas from './components/Tapitas'
import Chatbot from './components/Chatbot'
import Footer from './components/Footer'
import Admin from './components/Admin'

function App() {
  const [pantalla, setPantalla] = useState('inicio')
    // Muestra el panel administrativo cuando se visita /admin.
 
  const [carrito, setCarrito] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savebebi_carrito')) || []
    } catch {
      return []
    }
  })

  const [carritoAbierto, setCarritoAbierto] = useState(false)

  // Guarda el carrito cuando cambia su contenido.
  useEffect(() => {
    localStorage.setItem('savebebi_carrito', JSON.stringify(carrito))
  }, [carrito])

  // Agrega un producto o aumenta su cantidad.
  const agregarProducto = (producto) => {
    const nuevoProducto = {
      id: producto._id,
      nombre: producto.name,
      precio: producto.price,
      imagen: producto.image,
      cantidad: 1
    }

    setCarrito(actual => {
      const existe = actual.find(item => item.id === nuevoProducto.id)

      if (existe) {
        return actual.map(item =>
          item.id === nuevoProducto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }

      return [...actual, nuevoProducto]
    })

    setCarritoAbierto(true)
  }

  // Cambia la cantidad de un producto.
  const cambiarCantidad = (id, cantidad) => {
    setCarrito(actual =>
      actual
        .map(item =>
          item.id === id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
        .filter(item => item.cantidad > 0)
    )
  }

  // Elimina un producto.
  const eliminarProducto = (id) => {
    setCarrito(actual => actual.filter(item => item.id !== id))
  }

  // Vacía todo el carrito.
  const vaciarCarrito = () => {
    if (carrito.length && window.confirm('¿Quieres vaciar el carrito?')) {
      setCarrito([])
    }
  }

  // Prepara el pedido para enviarlo por WhatsApp.
  const finalizarPedido = () => {
    if (!carrito.length) return

    const formato = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    })

    const resumen = carrito.map(item =>
      `${item.cantidad} x ${item.nombre}: ${formato.format(item.precio * item.cantidad)}`
    ).join('\n')

    const total = carrito.reduce(
      (suma, item) => suma + item.precio * item.cantidad,
      0
    )

    const mensaje = encodeURIComponent(
      `Hola, quiero hacer este pedido en SaveBebi:\n\n${resumen}\n\nTotal: ${formato.format(total)}\n\n¿Me confirman disponibilidad y envío?`
    )

    window.open(
      `https://wa.me/3116382548?text=${mensaje}`,
      '_blank',
      'noopener'
    )
  }

  // Muestra el panel administrativo cuando se visita /admin.
if (window.location.pathname === '/admin') {
  return <Admin />
}

  if (pantalla === 'login') {
    return <Login />
  }

  return (
    <>
      <Header onLogin={() => setPantalla('login')} />

      <main>

       <Hero />

       <Features />

       <Nosotros />

        <Products
          onAdd={agregarProducto}
          onOpenCart={() => setCarritoAbierto(true)}
          cantidadCarrito={carrito.reduce(
            (total, item) => total + item.cantidad,
            0
          )}
        />

        <Tapitas />

        <Impact />

        <Donation />

      </main>

      <Footer />

      <Cart
        abierto={carritoAbierto}
        items={carrito}
        onClose={() => setCarritoAbierto(false)}
        onChange={cambiarCantidad}
        onRemove={eliminarProducto}
        onClear={vaciarCarrito}
        onCheckout={finalizarPedido}
      />
    

      <Chatbot />

    </>
  )
}

export default App
