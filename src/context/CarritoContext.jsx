import { createContext, useState } from 'react';

// Context permite que las tres pantallas compartan el mismo carrito.
export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);

  function agregarProducto(producto) {
    setCarrito((anterior) => {
      const encontrado = anterior.find((item) => item.id === producto.id);

      if (producto.stock === 0) return anterior;

      if (encontrado) {
        return anterior.map((item) => {
          if (item.id !== producto.id) return item;
          return {
            ...producto,
            cantidad: Math.min(item.cantidad + 1, producto.stock, 99),
          };
        });
      }

      return [...anterior, { ...producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(id, cantidad) {
    setCarrito((anterior) => anterior.map((item) => {
      if (item.id !== id) return item;
      return { ...item, cantidad: Math.min(cantidad, item.stock, 99) };
    }).filter((item) => item.cantidad > 0));
  }

  function eliminarProducto(id) {
    setCarrito((anterior) => anterior.filter((item) => item.id !== id));
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  // Estos valores se vuelven a calcular cuando cambia el carrito.
  let total = 0;
  let cantidadTotal = 0;
  for (const item of carrito) {
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  }

  return (
    <CarritoContext.Provider value={{
      carrito,
      total,
      cantidadTotal,
      agregarProducto,
      cambiarCantidad,
      eliminarProducto,
      vaciarCarrito,
    }}>
      {children}
    </CarritoContext.Provider>
  );
}
