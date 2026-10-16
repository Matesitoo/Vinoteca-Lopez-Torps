import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CarritoProvider } from '../context/CarritoContext';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <CarritoProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: '#FBF7F2' }, headerTintColor: '#782E47' }}>
          <Stack.Screen name="index" options={{ title: 'Vinoteca Lopez & Torps' }} />
          <Stack.Screen name="detalle/[id]" options={{ title: 'Detalle del vino' }} />
          <Stack.Screen name="carrito" options={{ title: 'Carrito y pago' }} />
        </Stack>
      </CarritoProvider>
    </SafeAreaProvider>
  );
}
