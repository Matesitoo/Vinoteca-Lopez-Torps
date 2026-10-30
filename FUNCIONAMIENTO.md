# Funcionamiento de la aplicación

## Estructura del código

1. `src/app/_layout.jsx`: el Stack contiene las tres pantallas. `ProveedorCarrito` las envuelve para compartir el estado.
2. `src/app/index.jsx`: `productos` empieza como un arreglo vacío. Al enfocar la pantalla, `useFocusEffect` ejecuta el GET para recuperar precios y stock vigentes. Se guarda la respuesta con `actualizarProductos` y se muestra usando `FlatList`.
3. `src/componentes/Producto.jsx`: recibe `producto` y `alPresionar` por props; muestra una tarjeta sin hacer peticiones ni guardar el carrito.
4. `src/app/detalle/[id].jsx`: el catálogo envía el ID en la navegación. `useLocalSearchParams` lo lee y el GET consulta el vino correspondiente.
5. `src/contexto/ContextoCarrito.jsx`: `useState` conserva el arreglo compartido. `find` busca un producto, `map` modifica cantidades y `filter` elimina. El total es precio por cantidad, sumado para todos los ítems.
6. `src/app/carrito.jsx`: cada `TextInput` tiene su estado. El botón arma un objeto `pedido`, lo convierte a JSON y hace POST. Si el servidor confirma, muestra la orden y vacía el carrito.
7. `backend/main.py`: FastAPI recibe el JSON y `BaseModel` valida su estructura. Después se comprueban existencia, stock y total real desde la base de datos.
8. `backend/base_datos.py`: abre la conexión a Supabase usando `DATABASE_URL`. Para desarrollo local, también permite SQLite. `database/supabase.sql` crea las tablas de PostgreSQL y carga los 20 vinos.

## Flujo de una compra

`GET /productos` → elegir vino → `GET /productos/1` → agregar al Context → completar formulario → `POST /checkout` → guardar orden y descontar stock → mostrar comprobante.

La app calcula un total para mostrarlo, pero el servidor **lo vuelve a calcular** usando los precios de la base. De ese modo no acepta un precio cambiado desde el cliente. La transacción SQL hace que guardar la orden y descontar stock sean una sola operación: `commit` confirma y `rollback` cancela si hay un error.

## Despliegue en producción

La web se publica en Vercel. Las peticiones a `/api/productos` y `/api/checkout` llegan a nuestro código de FastAPI. El servidor se conecta a PostgreSQL en Supabase con una contraseña que solo existe en el entorno del backend. No usamos la clave pública de Supabase en el frontend. Al confirmar una compra, `SELECT ... FOR UPDATE` bloquea las filas seleccionadas hasta guardar la orden y descontar el stock. SQLite permite trabajar localmente sin conexión a Supabase.

## Convenciones de lectura

El código propio usa nombres en español: `Catalogo`, `Navegacion`, `ProveedorCarrito`, `alPresionar`, `consultarApi` y `conectar_base`. Se conservan los identificadores requeridos por las bibliotecas (`useState`, `useEffect`, `onPress`, `children`, `app`) y el contrato JSON `items`. Los componentes `Boton`, `Campo` y `Producto` reciben props; las tres pantallas comparten `consultarApi` para consultar o enviar pedidos. El formato JavaScript/JSX está definido en `.prettierrc.json`.

## Catálogo actual

Usamos marcas reales de vinos argentinos, precios de demostración e imágenes ilustrativas. Las presentaciones varían: no todos los productos son botellas de 750 ml. `database/seed.json` define la carga inicial; `database/supabase.sql` actualiza el catálogo de Supabase sin reponer stock ni borrar órdenes. El despliegue usa Vercel y Supabase, sin Docker.

## Compra pendiente y reintentos

Antes de enviar el pedido se guarda localmente una clave única junto con los datos ficticios de la compra. Si se pierde la respuesta, la app permite recuperar esa misma compra incluso después de una recarga. El servidor devuelve el comprobante original cuando recibe nuevamente la misma clave. La tabla `compras_confirmadas` y la orden se confirman en una sola transacción, evitando descontar stock dos veces. La referencia ficticia no se guarda en la base del servidor.

El carrito permite actualizar precios y stock. La pantalla muestra un aviso para revisar el nuevo total antes de pagar. Los campos indican errores específicos y el comprobante muestra fecha, estado y método de pago.
