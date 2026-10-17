import { createContext, useState } from 'react';

// Context permite que las tres pantallas compartan el mismo carrito.
export const ContextoCarrito = createContext();

export function ProveedorCarrito({ children: contenido }) {
  const [carrito, actualizarCarrito] = useState([]);

  function agregarProducto(producto) {
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
      value={{ carrito, total, cantidadTotal, agregarProducto, cambiarCantidad, eliminarProducto, vaciarCarrito }}
    >
      {contenido}
    </ContextoCarrito.Provider>
  );
}
