import { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarritoContext } from '../context/CarritoContext';
import { URL_API, mostrarPrecio } from '../lib/config';
import { estilos } from '../styles/estilos';
import Boton from '../components/Boton';

export default function Carrito() {
  const router = useRouter();
  const { carrito, total, cambiarCantidad, eliminarProducto, vaciarCarrito } = useContext(CarritoContext);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [metodo, setMetodo] = useState('tarjeta');
  const [referencia, setReferencia] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [orden, setOrden] = useState(null);

  const formularioCompleto = nombre.trim().length >= 3 && direccion.trim().length >= 5 && referencia.trim().length >= 3;

  // Enviamos los datos al servidor. El backend vuelve a calcular el total.
  async function confirmarCompra() {
    if (cargando || !formularioCompleto || carrito.length === 0) return;
    setCargando(true);
    setError('');

    const pedido = {
      comprador: { nombre, direccion, metodo, referencia },
      items: carrito.map((item) => ({ id: item.id, cantidad: item.cantidad })),
      total,
    };

    try {
      const respuesta = await fetch(`${URL_API}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) throw new Error(typeof datos.detail === 'string' ? datos.detail : 'Revisá los datos del formulario.');

      setOrden(datos);
      vaciarCarrito();
    } catch (problema) {
      setError(problema.message || 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }

  // Primero mostramos el comprobante para que no lo tape el carrito vacío.
  if (orden) {
    return (
      <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={estilos.titulo}>¡Compra confirmada!</Text>
          <Text style={estilos.texto}>Gracias, {orden.comprador.nombre}.</Text>
          <Text selectable style={estilos.subtitulo}>Número de orden: {orden.id}</Text>
          {orden.items.map((item) => (
            <Text key={item.id} style={estilos.texto}>{item.cantidad} × {item.nombre}</Text>
          ))}
          <Text style={estilos.precio}>Total: {mostrarPrecio(orden.total)}</Text>
          <Text style={estilos.texto}>Entrega: {orden.comprador.direccion}</Text>
          <Text style={estilos.texto}>Pago simulado. No se realizó ningún cobro.</Text>
          <Boton titulo="Volver al catálogo" onPress={() => router.replace('/')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (carrito.length === 0) {
    return (
      <SafeAreaView style={estilos.centrado}>
        <Text style={estilos.titulo}>El carrito está vacío</Text>
        <Text style={estilos.texto}>Elegí un vino para comenzar tu compra.</Text>
        <Boton titulo="Ver catálogo" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={estilos.flexible} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo}>Tu carrito</Text>
          {carrito.map((item) => (
            <View key={item.id} style={estilos.tarjeta}>
              <View style={estilos.fila}>
                <Image source={{ uri: item.imagen }} style={estilos.imagenCarrito} />
                <View style={estilos.flexible}>
                  <Text style={estilos.subtitulo}>{item.nombre}</Text>
                  <Text style={estilos.texto}>{mostrarPrecio(item.precio)} por botella</Text>
                </View>
              </View>
              <View style={estilos.controles}>
                <Boton titulo="−" secundario deshabilitado={cargando} onPress={() => cambiarCantidad(item.id, item.cantidad - 1)} />
                <Text style={estilos.subtitulo}>{item.cantidad}</Text>
                <Boton titulo="+" secundario deshabilitado={cargando || item.cantidad >= Math.min(item.stock, 99)} onPress={() => cambiarCantidad(item.id, item.cantidad + 1)} />
              </View>
              <Text style={estilos.precio}>{mostrarPrecio(item.precio * item.cantidad)}</Text>
              <Boton titulo="Eliminar" secundario deshabilitado={cargando} onPress={() => eliminarProducto(item.id)} />
            </View>
          ))}
          <Boton titulo="Vaciar carrito" secundario deshabilitado={cargando} onPress={vaciarCarrito} />
          <Text style={estilos.precio}>Total a pagar: {mostrarPrecio(total)}</Text>

          <View style={estilos.tarjeta}>
            <Text style={estilos.subtitulo}>Datos de la compra</Text>
            <Text style={estilos.texto}>Completá el formulario con datos ficticios.</Text>
            <Text style={estilos.etiqueta}>Nombre y apellido</Text>
            <TextInput style={estilos.entrada} accessibilityLabel="Nombre y apellido" value={nombre} onChangeText={setNombre} placeholder="Ej. Ana Prueba" maxLength={100} editable={!cargando} />
            <Text style={estilos.etiqueta}>Dirección</Text>
            <TextInput style={estilos.entrada} accessibilityLabel="Dirección" value={direccion} onChangeText={setDireccion} placeholder="Calle, número y localidad" maxLength={200} editable={!cargando} />
            <Text style={estilos.etiqueta}>Método de pago</Text>
            <Boton titulo={`Tarjeta de prueba ${metodo === 'tarjeta' ? '✓' : ''}`} secundario deshabilitado={cargando} onPress={() => setMetodo('tarjeta')} />
            <Boton titulo={`Transferencia ${metodo === 'transferencia' ? '✓' : ''}`} secundario deshabilitado={cargando} onPress={() => setMetodo('transferencia')} />
            <Text style={estilos.etiqueta}>{metodo === 'tarjeta' ? 'Referencia ficticia de tarjeta' : 'Alias ficticio'}</Text>
            <TextInput style={estilos.entrada} accessibilityLabel="Referencia de pago" value={referencia} onChangeText={setReferencia} placeholder="Ej. TEST-1234" maxLength={80} editable={!cargando} autoCapitalize="none" />
            {error !== '' && <Text style={estilos.error}>{error}</Text>}
            <Boton titulo="Confirmar y pagar" cargando={cargando} deshabilitado={!formularioCompleto} onPress={confirmarCompra} />
            <Text style={estilos.texto}>Nombre y referencia: mínimo 3 caracteres. Dirección: mínimo 5.</Text>
          </View>
          <Boton titulo="Seguir comprando" secundario deshabilitado={cargando} onPress={() => router.replace('/')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
