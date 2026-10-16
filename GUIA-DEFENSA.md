# Cómo explicar el integrador

Integrantes: Santiago Lopez y Mateo Thorps.

## Qué retomamos de los trabajos anteriores

| Trabajo revisado | Tema que se reutiliza | Archivo de la tienda |
| --- | --- | --- |
| Agosto: lista con `Usuario` | `FlatList`, `keyExtractor`, `renderItem`, props | `src/app/index.jsx`, `src/components/Producto.jsx` |
| Septiembre: NASA y `useFetch` | `useState`, `useEffect`, `fetch`, carga y renderizado condicional | `src/app/index.jsx` y `src/app/detalle/[id].jsx` |
| Octubre: inicio y `[id]` | Stack, navegar pasando un parámetro y leerlo con `useLocalSearchParams` | `src/app/_layout.jsx` y `src/app/detalle/[id].jsx` |
| Carrito anterior: FastAPI | `BaseModel`, endpoints GET/POST y consultas SQL | `backend/main.py`, `backend/db.py` |

El repositorio `Matesitoo/Vinoteca-Lopez-Torps` estaba vacío al revisarlo; las referencias anteriores provienen de las carpetas locales. No se copiaron las integraciones de pago real ni el login del carrito anterior porque esta consigna pide pago simulado.

## Orden recomendado para estudiar el código

1. `src/app/_layout.jsx`: el Stack contiene las tres pantallas. `CarritoProvider` las envuelve para compartir el estado.
2. `src/app/index.jsx`: `productos` empieza como un arreglo vacío. Al montar la pantalla, `useEffect` ejecuta el GET. Se guarda la respuesta con `setProductos` y se muestra usando `FlatList`.
3. `src/components/Producto.jsx`: recibe `producto` y `onPress` por props; muestra una tarjeta sin hacer peticiones ni guardar el carrito.
4. `src/app/detalle/[id].jsx`: el catálogo envía el ID en la navegación. `useLocalSearchParams` lo lee y el GET consulta el vino correspondiente.
5. `src/context/CarritoContext.jsx`: `useState` conserva el arreglo compartido. `find` busca un producto, `map` modifica cantidades y `filter` elimina. El total es precio por cantidad, sumado para todos los ítems.
6. `src/app/carrito.jsx`: cada `TextInput` tiene su estado. El botón arma un objeto `pedido`, lo convierte a JSON y hace POST. Si el servidor confirma, muestra la orden y vacía el carrito.
7. `backend/main.py`: FastAPI recibe el JSON y `BaseModel` valida su estructura. Después se comprueban existencia, stock y total real desde SQLite.
8. `backend/db.py`: abre la conexión, crea las tablas y carga los 20 vinos desde el seed una sola vez.

## Flujo de una compra

`GET /productos` → elegir vino → `GET /productos/1` → agregar al Context → completar formulario → `POST /checkout` → guardar orden y descontar stock → mostrar comprobante.

La app calcula un total para mostrarlo, pero el servidor **lo vuelve a calcular** usando los precios de la base. De ese modo no acepta un precio cambiado desde el cliente. La transacción SQL hace que guardar la orden y descontar stock sean una sola operación: `commit` confirma y `rollback` cancela si hay un error.

## Preguntas para practicar juntos

- ¿Qué diferencia hay entre estado y props?
- ¿Por qué consultamos la API en `useEffect`?
- ¿Qué recibe `renderItem` y para qué sirve `keyExtractor`?
- ¿Qué valor tiene `id` al abrir `/detalle/3`?
- ¿Por qué el carrito se pierde al cerrar o recargar la app? (Su estado vive en memoria.)
- ¿Qué ocurre si la cantidad pedida supera el stock?
- ¿Por qué no alcanza con validar el formulario solo en la app?
- ¿Por qué la API debe tener una URL pública HTTPS para producción?

Lean las funciones y prueben sus cambios antes de defender. Ambos deben poder explicar el recorrido completo.
