# Vinoteca Lopez y Torps

Trabajo Práctico N.º 2 — Tienda móvil con carrito y pago simulado.

**Integrantes:** Santiago Lopez y Mateo Thorps.
**Materia:** Proyecto y Desarrollo de Software para Plataformas Móviles.
**Docente:** Prof. Leonardo Martínez.

Tienda de vinos argentinos con 20 vinos de marcas reales y presentaciones de 750 ml o 1 litro, categorías, búsqueda, detalle, carrito y pago simulado. Imágenes ilustrativas desde Unsplash, precios de demostración en pesos argentinos y ningún cobro real.

## Tecnologías

- App: React Native, Expo 57 y Expo Router (Stack), JavaScript/JSX.
- API propia: Python y FastAPI.
- Base de producción: PostgreSQL en Supabase. SQLite queda como opción para desarrollo local.
- Base inicial: `database/seed.json`. Los precios del seed están en centavos enteros; la API los devuelve en pesos.

El frontend queda en la raíz del repositorio para conservar la estructura del proyecto Expo. El backend está en `backend/` y la base inicial en `database/`.

## Ejecutar

Requisitos: Node.js compatible con Expo 57 (22.13 o superior) y Python 3.9 o superior. Recomendado Python 3.12.

Desde la raíz del proyecto, preparar el backend una vez:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements-dev.txt
```

En Windows, los ejecutables del entorno están en `backend/.venv/Scripts/`.

Iniciar backend:

```bash
npm run backend
```

Equivale a `backend/.venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 3001`. En Windows ejecutar el mismo comando con `backend/.venv/Scripts/python.exe`.

Sin `DATABASE_URL`, la base SQLite `backend/data/vinoteca.db` se crea y precarga automáticamente. Si `backend/.env` contiene esa variable, el servidor usa Supabase. Abrir `http://localhost:3001/api/docs` para ver y probar los endpoints.

En otra terminal:

```bash
npm ci
npm start
```

Escanear el QR con Expo Go compatible desde la misma Wi-Fi o presionar `w` para web. Para celular se usa la IP de Metro; web usa `localhost:3001`. Si hace falta, crear `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://IP-DE-TU-COMPUTADORA:3001
```

Reiniciar Expo después de cambiar esa variable. Un túnel de Expo no publica el backend.

## Catálogo y actualización de datos

Los precios son de demostración, no cotizaciones comerciales. Las fotografías son ilustrativas y no representan los envases de las marcas. El catálogo incluye Uvita, Termidor, Toro, Santa Julia y otras marcas argentinas. Cada descripción indica su presentación.

Editar `database/seed.json` no cambia por sí solo una base existente. Para actualizar Supabase, ejecutar `database/supabase.sql` en SQL Editor; para SQLite local, ejecutar `backend/.venv/bin/python -m backend.actualizar_catalogo`. Ambos conservan el stock existente y las órdenes. Las órdenes anteriores conservan los nombres y precios registrados al comprarlas.

La web y FastAPI se despliegan con Vercel; PostgreSQL está en Supabase. El proyecto no utiliza Docker. SQLite se utiliza únicamente como alternativa local.

## Estructura del proyecto

```text
src/
  app/
    _layout.jsx             # Stack y proveedor del carrito
    index.jsx               # GET inicial y FlatList
    detalle/[id].jsx         # Parámetro de ruta y detalle
    carrito.jsx             # Carrito, formulario, POST y comprobante
  componentes/
    Boton.jsx               # Botón reutilizable con props
    Producto.jsx            # Tarjeta reutilizable con props
    Campo.jsx               # Etiqueta y entrada del formulario
  contexto/
    ContextoCarrito.jsx     # useState compartido entre pantallas
  configuracion/api.js     # Peticiones al servidor y formato de precios
  estilos/estilos.js        # StyleSheet y Flexbox
backend/
  main.py                   # Modelos del pedido y endpoints
  base_datos.py             # Conexión a Supabase o SQLite local
  test_api.py               # Pruebas con una base temporal
```

Consultar [FUNCIONAMIENTO.md](FUNCIONAMIENTO.md) para conocer el flujo de datos, la compra y el despliegue.

## Organización y lectura del código

El código propio usa nombres en español y una indentación de dos espacios en JavaScript/JSX y cuatro en Python. Se mantienen los nombres que necesitan React Native, Expo y FastAPI, como `useState`, `onPress` y `app`, y el campo JSON `items` para conservar el contrato de la API.

- `Catalogo` consulta los productos con `useFocusEffect`, permite filtrarlos y abre el detalle por `id`.
- `Detalle` consulta el vino seleccionado y lo agrega al `ContextoCarrito`.
- `ProveedorCarrito` comparte los productos, las cantidades y el total entre las pantallas.
- `Carrito` usa `Campo` para el formulario y envía el pedido con `consultarApi`, la misma función que consulta catálogo y detalle.
- FastAPI valida el pedido y guarda la orden y el descuento de stock en una sola transacción.

Los componentes `Boton`, `Campo` y `Producto` reciben datos y acciones mediante props. Los estilos compartidos están en `estilos.js`. Se evita repetir código y se mantienen instrucciones legibles. `.prettierrc.json` define el formato del frontend.

## API

- `GET /health`: estado del servidor.
- `GET /productos`: catálogo.
- `GET /productos/1`: detalle de un vino.
- `POST /checkout`: valida el comprador, los productos, las cantidades, el stock y el total; guarda la orden y devuelve 201 con comprobante.

Ejemplo de pedido:

```json
{
  "clave": "7b394cec-f053-4bd1-8b29-36f27b06b206",
  "comprador": {
    "nombre": "Ana Prueba",
    "direccion": "Calle Ficticia 123",
    "metodo": "tarjeta",
    "referencia": "TEST-1234"
  },
  "items": [{"id": 1, "cantidad": 1}],
  "total": 1800
}
```

Los métodos son `tarjeta` o `transferencia`, ambos simulados. La referencia de pago no se guarda en la base del servidor. Los errores tienen `detail`, como en FastAPI. La app deshabilita los controles al pagar. Cada compra de la app lleva una clave única. Antes de enviarla, se conserva localmente como compra pendiente, con los datos ficticios del formulario. Si se pierde la conexión o se recarga la app, «Recuperar compra» reenvía la misma clave y obtiene la misma orden sin duplicarla. Al confirmar o recibir un rechazo definitivo se elimina la compra pendiente. El carrito común vive en memoria y se vacía al cerrar o recargar la app.

Ante un error de precio o stock, usar «Actualizar precios y stock» en el carrito y revisar el total. Los productos agotados se retiran y las cantidades se ajustan a la disponibilidad. Las bases de las versiones anteriores (`tienda.sqlite` y `vinos.sqlite`) se conservan sin modificar; esta versión usa `vinoteca.db`.

## Verificar

```bash
npm run lint
npm run typecheck
npm run test:backend
npx expo export --platform all
```

Las pantallas son JSX y se revisan con lint; TypeScript solo revisa los archivos TS que queden. Las pruebas usan una base temporal. Probar manualmente: filtrar, abrir detalle, agregar, cambiar cantidades, eliminar, vaciar, completar formulario y pagar. Comprobar también carrito vacío, error de conexión y producto sin stock.

## Producción en Vercel + Supabase

El código queda preparado para un solo dominio: web Expo en `/` y API propia FastAPI en `/api`. El frontend consulta nuestra API; la API consulta PostgreSQL. La base no se expone directamente a la app.

**Sitio publicado:** web y API en Production: https://vinoteca-lopez-torps.vercel.app. Las rutas web, el catálogo de 20 productos y el esquema actualizado de la API se verificaron con consultas de lectura. Las compras, los reintentos y la concurrencia se probaron con una base temporal. En producción se verificó además la orden simulada 6: una unidad de Uvita Tinto; al reenviar la misma clave se obtuvo el mismo comprobante y quedó una sola orden. Los cambios posteriores requieren un nuevo despliegue. La instalación y prueba del APK en un teléfono quedan pendientes.

### 1. Crear Supabase

Crear un proyecto llamado `vinoteca-lopez-torps`. En SQL Editor ejecutar `database/supabase.sql`: crea `productos`, `ordenes`, `compras_confirmadas` y precarga 20 vinos. Puede ejecutarse de nuevo para actualizar nombres, descripciones, precios, imágenes y categorías sin borrar pedidos ni reponer stock. RLS queda activado y los roles públicos no tienen acceso a estas tablas.

En **Connect → Transaction pooler**, copiar la URI PostgreSQL (puerto 6543) con la contraseña de la base. Se usa como `DATABASE_URL`, únicamente en el servidor. Codificar los caracteres especiales de la contraseña al formar la URI. La API usa TLS y desactiva las sentencias preparadas para ser compatible con ese pooler.

Para usar Supabase también en desarrollo, copiar `backend/.env.example` a `backend/.env` y completar `DATABASE_URL`. Nunca subir ese archivo a GitHub. Sin esa variable, el desarrollo continúa usando la base SQLite local.

### 2. Crear el proyecto de Vercel

Importar `Matesitoo/Vinoteca-Lopez-Torps`, con nombre `vinoteca-lopez-torps`, raíz del repositorio y rama de producción `main`.

- Framework: **Other** (`framework: null`).
- Install Command: `npm ci`.
- Build Command: `npx expo export --platform web`.
- Output Directory: `dist`.
- Python: 3.12, indicado en `.python-version` y `pyproject.toml`.
- Variable **Production**: `DATABASE_URL`, con la conexión de Supabase.
- Variable opcional: `CORS_ORIGIN`, con el dominio final; el valor predeterminado permite el consumo desde la app.

`vercel.json` ya incluye el build, la función `api/index.py` y las rutas. No poner `DATABASE_URL` en variables `EXPO_PUBLIC_`: esas variables se incluyen en el JavaScript público. Para la web no hace falta `EXPO_PUBLIC_API_URL`, ya que usa `/api` del mismo sitio.

### 3. Publicar y comprobar

Crear un deployment de **Production** (no solo Preview). Cuando termine:

- Abrir `/api/health`.
- Abrir `/api/productos` y comprobar que se devuelven los 20 vinos.
- Abrir `/api/docs` para ver la documentación de nuestra API.
- Comprar con datos ficticios, comprobar el número de orden y verificar la fila en Supabase.
- Recargar `/detalle/1` y `/carrito` para comprobar las rutas de la web.

En Vercel no se escribe una base SQLite: si falta `DATABASE_URL`, el backend falla en vez de crear una base efímera.

### App móvil instalada

`eas.json` configura `EXPO_PUBLIC_API_URL=https://vinoteca-lopez-torps.vercel.app/api` en los perfiles preview y production. El proyecto está vinculado a [Expo](https://expo.dev/accounts/bachalopez/projects/vinoteca-lopez-torps). Para generar un APK instalable:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

La web publicada en Vercel y el APK son entregas diferentes. Probar también el APK contra la API pública.

Repositorio: https://github.com/Matesitoo/Vinoteca-Lopez-Torps.

### Actualizaciones de producción

El primer despliegue se hizo con la CLI oficial de Vercel. El enlace automático con `Matesitoo/Vinoteca-Lopez-Torps` todavía requiere que Vercel tenga acceso a ese repositorio desde GitHub; hacer push por sí solo no vuelve a publicar. Hasta conectar ese permiso, ejecutar desde la carpeta del proyecto autenticada:

```bash
npx vercel@latest deploy --prod --yes --scope bachalopez22s-projects
```

La variable `DATABASE_URL` está guardada como Secret en Production. `.vercelignore` excluye los archivos locales de credenciales y las bases de desarrollo de los uploads.

## Recuperación de compras

`compras_confirmadas` conserva la clave, una huella del pedido y su comprobante dentro de la misma transacción que guarda la orden y descuenta stock. Una clave repetida con el mismo pedido devuelve el comprobante original; con otros datos devuelve 409. Las solicitudes simultáneas se serializan mediante un bloqueo transaccional en PostgreSQL. Para bases existentes, ejecutar `database/checkout_seguro.sql` antes de desplegar el backend actualizado. No se guarda la referencia ficticia en el servidor.

El catálogo y el detalle se actualizan al volver a sus pantallas. El comprobante incluye fecha, estado, método y subtotales. Las imágenes disponen de un estado alternativo cuando no cargan.

La generación del APK no forma parte de esta actualización. La configuración de Expo queda disponible para una futura compilación.
