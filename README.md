# Vinoteca Lopez & Torps

Trabajo Práctico N.º 2 — Tienda móvil con carrito y pago simulado.

**Integrantes:** Santiago Lopez y Mateo Thorps.
**Materia:** Proyecto y Desarrollo de Software para Plataformas Móviles.
**Docente:** Prof. Leonardo Martínez.

Tienda de vinos argentinos con 20 etiquetas ficticias, categorías, búsqueda, detalle, carrito y pago simulado. Imágenes ilustrativas desde Unsplash, precios de demostración en pesos argentinos y ningún cobro real.

## Tecnologías

- App: React Native, Expo 57 y Expo Router (Stack), JavaScript/JSX.
- API propia: Python y FastAPI.
- Base de producción: PostgreSQL en Supabase. SQLite queda como opción para practicar localmente.
- Base inicial: `database/seed.json`. Los precios del seed están en centavos enteros; la API los devuelve en pesos.

El frontend queda en la raíz del repositorio para conservar la estructura del proyecto Expo. El backend está en `backend/` y la base inicial en `database/`.

## Ejecutar

Requisitos: Node.js compatible con Expo 57 (22.13 o superior) y Python 3.9 o superior. Recomendado Python 3.12.

Desde la raíz de `mercalibre`, preparar el backend una vez:

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

La base `backend/data/vinoteca.db` se crea y precarga automáticamente. Abrir `http://localhost:3001/api/docs` para ver y probar los endpoints.

En otra terminal:

```bash
npm install
npm start
```

Escanear el QR con Expo Go compatible desde la misma Wi-Fi o presionar `w` para web. Para celular se usa la IP de Metro; web usa `localhost:3001`. Si hace falta, crear `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://IP-DE-TU-COMPUTADORA:3001
```

Reiniciar Expo después de cambiar esa variable. Un túnel de Expo no publica el backend.

## Archivos para estudiar

```text
src/
  app/
    _layout.jsx             # Stack y proveedor del carrito
    index.jsx               # GET inicial y FlatList
    detalle/[id].jsx         # Parámetro de ruta y detalle
    carrito.jsx             # Carrito, formulario, POST y comprobante
  components/
    Boton.jsx               # Botón reutilizable con props
    Producto.jsx            # Tarjeta reutilizable con props
  context/
    CarritoContext.jsx      # useState compartido entre pantallas
  lib/config.js             # URL del servidor y formato de precios
  styles/estilos.js         # StyleSheet y Flexbox
backend/
  main.py                   # Modelos del pedido y endpoints
  db.py                     # Conexión a Supabase o SQLite local
  test_api.py               # Pruebas con una base temporal
```

Leer [GUIA-DEFENSA.md](GUIA-DEFENSA.md) para relacionarlo con los trabajos anteriores y practicar la explicación.

## API

- `GET /health`: estado del servidor.
- `GET /productos`: catálogo.
- `GET /productos/1`: detalle de un vino.
- `POST /checkout`: valida el comprador, los productos, las cantidades, el stock y el total; guarda la orden y devuelve 201 con comprobante.

Ejemplo de pedido:

```json
{
  "comprador": {
    "nombre": "Ana Prueba",
    "direccion": "Calle Ficticia 123",
    "metodo": "tarjeta",
    "referencia": "TEST-1234"
  },
  "items": [{"id": 1, "cantidad": 1}],
  "total": 12500
}
```

Los métodos son `tarjeta` o `transferencia`, ambos simulados. La referencia de pago no se guarda. Los errores tienen `detail`, como en FastAPI. La app deshabilita los controles al pagar. No hay reintento automático de compras: si se corta la conexión después de enviar un pedido, revisar la base antes de repetirlo para no generar otra orden. El carrito vive en memoria y se vacía al cerrar o recargar la app.

Ante un error de precio o stock, actualizar el catálogo, quitar el producto del carrito y agregarlo de nuevo. Las bases de las versiones anteriores (`tienda.sqlite` y `vinos.sqlite`) se conservan sin modificar; esta versión usa `vinoteca.db`.

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

**Estado:** pendiente crear/conectar los proyectos y validar una compra contra la base real. El SQL y la configuración están en el repositorio, pero eso no significa que ya estén publicados.

### 1. Crear Supabase

Crear un proyecto llamado `vinoteca-lopez-torps`. En SQL Editor ejecutar `database/supabase.sql`: crea `productos`, `ordenes` y precarga 20 vinos. Puede ejecutarse de nuevo sin borrar pedidos ni reponer stock. RLS queda activado y los roles públicos no tienen acceso a estas tablas.

En **Connect → Transaction pooler**, copiar la URI PostgreSQL (puerto 6543) con la contraseña de la base. Se usa como `DATABASE_URL`, únicamente en el servidor. Codificar los caracteres especiales de la contraseña al formar la URI. La API usa TLS y desactiva las sentencias preparadas para ser compatible con ese pooler.

Para usar Supabase también en desarrollo, copiar `backend/.env.example` a `backend/.env` y completar `DATABASE_URL`. Nunca subir ese archivo a GitHub. Sin esa variable, el desarrollo continúa usando la base SQLite local.

### 2. Crear el proyecto de Vercel

Importar `Matesitoo/Vinoteca-Lopez-Torps`, con nombre `vinoteca-lopez-torps`, raíz del repositorio y rama de producción `main`.

- Framework: **Other** (`framework: null`).
- Build Command: `npx expo export --platform web`.
- Output Directory: `dist`.
- Python: 3.12, indicado en `.python-version`.
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

Configurar `EXPO_PUBLIC_API_URL=https://DOMINIO-REAL.vercel.app/api` antes de construir el APK:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

La web publicada en Vercel y el APK son entregas diferentes. Probar también el APK contra la API pública para la defensa móvil.

Repositorio: https://github.com/Matesitoo/Vinoteca-Lopez-Torps. Ambos integrantes deben hacer sus propios commits y poder explicar el código.
