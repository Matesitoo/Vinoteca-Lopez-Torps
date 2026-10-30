import Constants from 'expo-constants';
import { Platform } from 'react-native';

// En el celular usamos la IP de la computadora que ejecuta Expo.
const servidorExpo = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const servidorLocal = Platform.OS === 'web' ? 'localhost' : servidorExpo;

// En la web de Vercel usamos /api. En el celular usamos la URL HTTPS pública.
export const URL_API =
  process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? `http://${servidorLocal}:3001` : Platform.OS === 'web' ? '/api' : '');

export function mostrarPrecio(precio) {
  return '$ ' + precio.toLocaleString('es-AR');
}

// Las tres pantallas usan la misma conexión y los mismos mensajes de error.
export async function consultarApi(ruta, pedido) {
  if (!URL_API) throw new Error('Falta configurar la dirección de la API.');
  const opciones = pedido
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido) }
    : {};
  const controlador = new AbortController();
  const espera = setTimeout(() => controlador.abort(), 20000);
  try {
    const respuesta = await fetch(`${URL_API.replace(/\/$/, '')}${ruta}`, {
      ...opciones, signal: controlador.signal,
    });
    const datos = await respuesta.json().catch(() => {
      throw new Error('La tienda devolvió una respuesta inválida. Podés reintentar la misma compra.');
    });
    if (!respuesta.ok) {
      const error = new Error(typeof datos.detail === 'string' ? datos.detail : 'Revisá los datos enviados.');
      error.status = respuesta.status;
      throw error;
    }
    return datos;
  } catch (error) {
    if (error.status) throw error;
    throw new Error('No se pudo confirmar la respuesta de la tienda. Revisá tu conexión y reintentá.');
  } finally {
    clearTimeout(espera);
  }
}
