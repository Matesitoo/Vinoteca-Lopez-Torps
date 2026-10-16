# MercaLibre Vinos

Trabajo Práctico N.º 2 — Tienda móvil con carrito y pago simulado.

**Integrantes:** Santiago Lopez y Mateo Thorps.
**Materia:** Proyecto y Desarrollo de Software para Plataformas Móviles.
**Docente:** Prof. Leonardo Martínez.

Tienda de vinos argentinos con 20 etiquetas ficticias, categorías, búsqueda, detalle, carrito y pago simulado. Imágenes ilustrativas desde Unsplash, precios de demostración en pesos argentinos y ningún cobro real.

## Tecnologías

- App: React Native, Expo 57 y Expo Router (Stack), JavaScript/JSX.
- Backend: Python, FastAPI y SQLite.
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

La base `backend/data/vinoteca.db` se crea y precarga automáticamente. Abrir `http://localhost:3001/docs` para ver y probar los endpoints.

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
  db.py                     # SQLite y carga inicial
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

## Producción y entrega

Todavía falta publicar el backend y generar/instalar el build móvil. Expo Go es el entorno de desarrollo.

Para backend hay un Dockerfile que se construye desde la raíz:

```bash
docker build -f backend/Dockerfile -t vinoteca-api .
docker run -p 3001:3001 -v vinoteca-data:/data vinoteca-api
```

El hosting debe proporcionar HTTPS y un disco persistente en `/data`. Variables: `PORT`, `DB_PATH=/data/vinoteca.db` y `CORS_ORIGIN` (origen web o `*` para la demostración). SQLite usa una sola instancia con un disco compartido por ese proceso. La base debe persistir después de reiniciar el contenedor.

Configurar `EXPO_PUBLIC_API_URL=https://TU-API` antes de generar el build. Luego:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

`preview` genera un APK para instalar y demostrar sin Metro. `production` configura la distribución de Android. Probar el recorrido completo en el APK con la API pública antes de entregar.

Repositorio indicado por el equipo: https://github.com/Matesitoo/Vinoteca-Lopez-Torps (estaba vacío al revisarlo). Esta revisión no publica commits automáticamente. Ambos integrantes deben realizar sus propios commits y poder explicar el código.
