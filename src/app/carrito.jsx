import { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import { consultarApi, mostrarPrecio } from '../configuracion/api';
import { estilos } from '../estilos/estilos';
import Boton from '../componentes/Boton';
import Campo from '../componentes/Campo';

export default function Carrito() {
  const navegacion = useRouter();
  const { carrito, total, cambiarCantidad, eliminarProducto, vaciarCarrito } = useContext(ContextoCarrito);
  const [nombre, cambiarNombre] = useState('');
  const [direccion, cambiarDireccion] = useState('');
  const [metodo, cambiarMetodo] = useState('tarjeta');
  const [referencia, cambiarReferencia] = useState('');
  const [cargando, cambiarCarga] = useState(false);
  const [error, cambiarError] = useState('');
  const [orden, guardarOrden] = useState(null);

  const formularioCompleto = nombre.trim().length >= 3 && direccion.trim().length >= 5 && referencia.trim().length >= 3;

  // Enviamos los datos al servidor. El backend vuelve a calcular el total.
  async function confirmarCompra() {
    if (cargando || !formularioCompleto || carrito.length === 0) return;
    cambiarCarga(true);
    cambiarError('');

    const pedido = {
      comprador: { nombre, direccion, metodo, referencia },
      items: carrito.map((articulo) => ({ id: articulo.id, cantidad: articulo.cantidad })),
      total,
    };

    try {
      const datos = await consultarApi('/checkout', pedido);
      guardarOrden(datos);
      vaciarCarrito();
    } catch (problema) {
      cambiarError(problema.message || 'No se pudo conectar con el servidor.');
    } finally {
      cambiarCarga(false);
    }
  }

  // Primero mostramos el comprobante para que no lo tape el carrito vacío.
  if (orden) {
    return (
      <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={estilos.titulo}>¡Compra confirmada!</Text>
          <Text style={estilos.texto}>Gracias, {orden.comprador.nombre}.</Text>
          <Text selectable style={estilos.subtitulo}>
            Número de orden: {orden.id}
          </Text>
          {orden.items.map((articulo) => (
            <Text key={articulo.id} style={estilos.texto}>
              {articulo.cantidad} × {articulo.nombre}
            </Text>
          ))}
          <Text style={estilos.precio}>Total: {mostrarPrecio(orden.total)}</Text>
          <Text style={estilos.texto}>Entrega: {orden.comprador.direccion}</Text>
          <Text style={estilos.texto}>Pago simulado. No se realizó ningún cobro.</Text>
          <Boton titulo="Volver al catálogo" alPresionar={() => navegacion.replace('/')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (carrito.length === 0) {
    return (
      <SafeAreaView style={estilos.centrado}>
        <Text style={estilos.titulo}>El carrito está vacío</Text>
        <Text style={estilos.texto}>Elegí un vino para comenzar tu compra.</Text>
        <Boton titulo="Ver catálogo" alPresionar={() => navegacion.replace('/')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={estilos.flexible} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo}>Tu carrito</Text>
          {carrito.map((articulo) => (
            <View key={articulo.id} style={estilos.tarjeta}>
              <View style={estilos.fila}>
                <Image source={{ uri: articulo.imagen }} style={estilos.imagenCarrito} />
                <View style={estilos.flexible}>
                  <Text style={estilos.subtitulo}>{articulo.nombre}</Text>
                  <Text style={estilos.texto}>{mostrarPrecio(articulo.precio)} por botella</Text>
                </View>
              </View>
              <View style={estilos.controles}>
                <Boton
                  titulo="−"
                  secundario
                  deshabilitado={cargando}
                  alPresionar={() => cambiarCantidad(articulo.id, articulo.cantidad - 1)}
                />
                <Text style={estilos.subtitulo}>{articulo.cantidad}</Text>
                <Boton
                  titulo="+"
                  secundario
                  deshabilitado={cargando || articulo.cantidad >= Math.min(articulo.stock, 99)}
                  alPresionar={() => cambiarCantidad(articulo.id, articulo.cantidad + 1)}
                />
              </View>
              <Text style={estilos.precio}>{mostrarPrecio(articulo.precio * articulo.cantidad)}</Text>
              <Boton
                titulo="Eliminar"
                secundario
                deshabilitado={cargando}
                alPresionar={() => eliminarProducto(articulo.id)}
              />
            </View>
          ))}
          <Boton titulo="Vaciar carrito" secundario deshabilitado={cargando} alPresionar={vaciarCarrito} />
          <Text style={estilos.precio}>Total a pagar: {mostrarPrecio(total)}</Text>

          <View style={estilos.tarjeta}>
            <Text style={estilos.subtitulo}>Datos de la compra</Text>
            <Text style={estilos.texto}>Completá el formulario con datos ficticios.</Text>
            <Campo
              etiqueta="Nombre y apellido"
              valor={nombre}
              alCambiar={cambiarNombre}
              ayuda="Ej. Ana Prueba"
              editable={!cargando}
            />
            <Campo
              etiqueta="Dirección"
              valor={direccion}
              alCambiar={cambiarDireccion}
              ayuda="Calle, número y localidad"
              limite={200}
              editable={!cargando}
            />
            <Text style={estilos.etiqueta}>Método de pago</Text>
            <Boton
              titulo={`Tarjeta de prueba ${metodo === 'tarjeta' ? '✓' : ''}`}
              secundario
              deshabilitado={cargando}
              alPresionar={() => cambiarMetodo('tarjeta')}
            />
            <Boton
              titulo={`Transferencia ${metodo === 'transferencia' ? '✓' : ''}`}
              secundario
              deshabilitado={cargando}
              alPresionar={() => cambiarMetodo('transferencia')}
            />
            <Campo
              etiqueta={metodo === 'tarjeta' ? 'Referencia ficticia de tarjeta' : 'Alias ficticio'}
              valor={referencia}
              alCambiar={cambiarReferencia}
              ayuda="Ej. TEST-1234"
              limite={80}
              editable={!cargando}
            />
            {error !== '' && <Text style={estilos.error}>{error}</Text>}
            <Boton
              titulo="Confirmar y pagar"
              cargando={cargando}
              deshabilitado={!formularioCompleto}
              alPresionar={confirmarCompra}
            />
            <Text style={estilos.texto}>Nombre y referencia: mínimo 3 caracteres. Dirección: mínimo 5.</Text>
          </View>
          <Boton
            titulo="Seguir comprando"
            secundario
            deshabilitado={cargando}
            alPresionar={() => navegacion.replace('/')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
