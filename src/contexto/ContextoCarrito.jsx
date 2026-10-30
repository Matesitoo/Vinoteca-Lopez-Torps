import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

// Context permite que las tres pantallas compartan el mismo carrito.
export const ContextoCarrito = createContext();

export function ProveedorCarrito({ children: contenido }) {
  const [carrito, actualizarCarrito] = useState([]);
  const [pedidoPendiente, cambiarPendiente] = useState(null);
  const [recuperando, cambiarRecuperando] = useState(true);
  const [errorAlmacenamiento, cambiarErrorAlmacenamiento] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('vinoteca.compraPendiente')
      .then((valor) => { if (valor) cambiarPendiente(JSON.parse(valor)); })
      .catch(() => cambiarErrorAlmacenamiento('No se pudo recuperar la compra pendiente. Revisá el almacenamiento del dispositivo y recargá la app.'))
      .finally(() => cambiarRecuperando(false));
  }, []);

  async function guardarPedidoPendiente(pedido) {
    // Guardar antes de enviar permite reintentar la misma compra tras una recarga.
    await AsyncStorage.setItem('vinoteca.compraPendiente', JSON.stringify(pedido));
    cambiarPendiente(pedido);
  }

  async function borrarPedidoPendiente() {
    await AsyncStorage.removeItem('vinoteca.compraPendiente');
    cambiarPendiente(null);
  }

  function sincronizarCarrito(productos) {
    if (pedidoPendiente) return;
    actualizarCarrito((anterior) => anterior.flatMap((articulo) => {
      const vigente = productos.find((producto) => producto.id === articulo.id);
      if (!vigente || vigente.stock <= 0) return [];
      return [{ ...vigente, cantidad: Math.min(articulo.cantidad, vigente.stock, 99) }];
    }));
  }

  function agregarProducto(producto) {
    if (pedidoPendiente || recuperando || errorAlmacenamiento) return;
    actualizarCarrito((anterior) => {
      const encontrado = anterior.find((articulo) => articulo.id === producto.id);

      if (producto.stock === 0) return anterior;

      if (encontrado) {
        return anterior.map((articulo) => {
          if (articulo.id !== producto.id) return articulo;
          return { ...producto, cantidad: Math.min(articulo.cantidad + 1, producto.stock, 99) };
        });
      }

      return [...anterior, { ...producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(id, cantidad) {
    if (pedidoPendiente) return;
    actualizarCarrito((anterior) =>
      anterior
        .map((articulo) => {
          if (articulo.id !== id) return articulo;
          return { ...articulo, cantidad: Math.min(cantidad, articulo.stock, 99) };
        })
        .filter((articulo) => articulo.cantidad > 0),
    );
  }

  function eliminarProducto(id) {
    if (pedidoPendiente) return;
    actualizarCarrito((anterior) => anterior.filter((articulo) => articulo.id !== id));
  }

  function vaciarCarrito() {
    actualizarCarrito([]);
  }

  // Estos valores se vuelven a calcular cuando cambia el carrito.
  let total = 0;
  let cantidadTotal = 0;
  for (const articulo of carrito) {
    total += articulo.precio * articulo.cantidad;
    cantidadTotal += articulo.cantidad;
  }

  return (
    <ContextoCarrito.Provider
      value={{ carrito, total, cantidadTotal, agregarProducto, cambiarCantidad, eliminarProducto, vaciarCarrito,
        sincronizarCarrito, pedidoPendiente, guardarPedidoPendiente, borrarPedidoPendiente,
        recuperando, errorAlmacenamiento }}
    >
      {contenido}
    </ContextoCarrito.Provider>
  );
}
