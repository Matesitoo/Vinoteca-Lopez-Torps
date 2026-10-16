import Constants from 'expo-constants';
import { Platform } from 'react-native';

// En el celular usamos la IP de la computadora que ejecuta Expo.
const host = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const servidorLocal = Platform.OS === 'web' ? 'localhost' : host;

// En la web de Vercel usamos /api. En el celular usamos la URL HTTPS pública.
export const URL_API = process.env.EXPO_PUBLIC_API_URL || (
  __DEV__ ? `http://${servidorLocal}:3001` : (Platform.OS === 'web' ? '/api' : '')
);

export function mostrarPrecio(precio) {
  return '$ ' + precio.toLocaleString('es-AR');
}
