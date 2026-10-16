import Constants from 'expo-constants';
import { Platform } from 'react-native';

// En el celular usamos la IP de la computadora que ejecuta Expo.
const host = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const servidorLocal = Platform.OS === 'web' ? 'localhost' : host;

// En producción esta variable debe contener la URL HTTPS del backend.
export const URL_API = process.env.EXPO_PUBLIC_API_URL || (
  __DEV__ ? `http://${servidorLocal}:3001` : ''
);

export function mostrarPrecio(precio) {
  return '$ ' + precio.toLocaleString('es-AR');
}
