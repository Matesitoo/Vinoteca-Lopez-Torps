import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ProveedorCarrito } from '../contexto/ContextoCarrito';

export default function Navegacion() {
  return (
    <SafeAreaProvider>
      <ProveedorCarrito>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: '#FBF7F2' }, headerTintColor: '#782E47' }}>
          <Stack.Screen name="index" options={{ title: 'Vinoteca Lopez & Torps' }} />
          <Stack.Screen name="detalle/[id]" options={{ title: 'Detalle del vino' }} />
          <Stack.Screen name="carrito" options={{ title: 'Carrito y pago' }} />
        </Stack>
      </ProveedorCarrito>
    </SafeAreaProvider>
  );
}
