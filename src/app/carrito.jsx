import { useContext, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import { consultarApi, mostrarPrecio } from '../configuracion/api';
import { estilos } from '../estilos/estilos';
import Boton from '../componentes/Boton';
import Campo from '../componentes/Campo';
import ImagenProducto from '../componentes/ImagenProducto';

export default function Carrito() {
  const navegacion = useRouter();
  const {
    carrito, total, cambiarCantidad, eliminarProducto, vaciarCarrito, sincronizarCarrito,
    pedidoPendiente, guardarPedidoPendiente, borrarPedidoPendiente, recuperando, errorAlmacenamiento,
  } = useContext(ContextoCarrito);
  const [nombre, cambiarNombre] = useState('');
  const [direccion, cambiarDireccion] = useState('');
  const [metodo, cambiarMetodo] = useState('tarjeta');
  const [referencia, cambiarReferencia] = useState('');
  const [cargando, cambiarCarga] = useState(false);
  const [error, cambiarError] = useState('');
  const [aviso, cambiarAviso] = useState('');
  const [validar, cambiarValidar] = useState(false);
  const [orden, guardarOrden] = useState(null);
  const enviando = useRef(false);
  const formularioCompleto = nombre.trim().length >= 3 && direccion.trim().length >= 5 && referencia.trim().length >= 3;

  async function actualizarCarrito() {
    if (enviando.current || pedidoPendiente) return;
    enviando.current = true;
    cambiarCarga(true);
    cambiarError('');
    try {
      const productos = await consultarApi('/productos');
      sincronizarCarrito(productos);
      cambiarAviso('Carrito actualizado. Revisá las cantidades y el total antes de confirmar. Los productos agotados se retiraron.');
    } catch (problema) {
      cambiarError(problema.message);
    } finally {
      enviando.current = false;
      cambiarCarga(false);
    }
  }

  async function confirmarCompra() {
    cambiarValidar(true);
    if (enviando.current || (!pedidoPendiente && (!formularioCompleto || carrito.length === 0))) return;
    enviando.current = true;
    cambiarCarga(true);
    cambiarError('');
    let pedido = pedidoPendiente;
    let enviado = false;
    try {
      if (!pedido) {
        pedido = {
          clave: randomUUID(),
          comprador: { nombre: nombre.trim(), direccion: direccion.trim(), metodo, referencia: referencia.trim() },
          items: carrito.map((articulo) => ({ id: articulo.id, cantidad: articulo.cantidad })),
          total,
        };
        await guardarPedidoPendiente(pedido);
      }
      enviado = true;
      const datos = await consultarApi('/checkout', pedido);
      // Si falla el borrado local, conservamos la compra para recuperar la misma orden.
      await borrarPedidoPendiente();
      guardarOrden(datos);
      vaciarCarrito();
    } catch (problema) {
      if (problema.status >= 400 && problema.status < 500) {
        try { await borrarPedidoPendiente(); } catch {
          cambiarError('No se pudo liberar la compra guardada. Reintentá para recuperar su resultado.');
          return;
        }
      }
      cambiarError(enviado ? problema.message : 'No se pudo guardar la compra en este dispositivo. No se envió el pedido. Revisá el almacenamiento.');
    } finally {
      enviando.current = false;
      cambiarCarga(false);
    }
  }

  if (recuperando || errorAlmacenamiento) {
    return (
      <SafeAreaView style={estilos.centrado}>
        {recuperando ? <ActivityIndicator accessibilityLabel="Recuperando compra pendiente" color="#782E47" /> :
          <Text role="alert" style={estilos.error}>{errorAlmacenamiento}</Text>}
      </SafeAreaView>
    );
  }

  if (orden) {
    return (
      <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text role="status" accessibilityLiveRegion="polite" style={estilos.titulo}>¡Compra confirmada!</Text>
          <Text style={estilos.texto}>Gracias, {orden.comprador.nombre}.</Text>
          <Text selectable style={estilos.subtitulo}>Número de orden: {orden.id}</Text>
          <Text style={estilos.texto}>Fecha: {new Date(orden.fecha).toLocaleString('es-AR')}</Text>
          <Text style={estilos.texto}>Estado: aprobado · pago simulado</Text>
          <Text style={estilos.texto}>Método: {orden.comprador.metodo === 'transferencia' ? 'Transferencia simulada' : 'Tarjeta de prueba'}</Text>
          {orden.items.map((articulo) => (
            <Text key={articulo.id} style={estilos.texto}>
              {articulo.cantidad} × {articulo.nombre} · {mostrarPrecio(articulo.precio * articulo.cantidad)}
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

  // Una compra guardada se puede recuperar incluso después de recargar la app.
  if (pedidoPendiente) {
    return (
      <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={estilos.titulo}>Compra pendiente de confirmar</Text>
          <Text style={estilos.texto}>Reintentá para recuperar el comprobante o completar esta misma compra. El reintento no crea otra orden.</Text>
          <Text style={estilos.texto}>Comprador: {pedidoPendiente.comprador.nombre}</Text>
          <Text style={estilos.precio}>Total: {mostrarPrecio(pedidoPendiente.total)}</Text>
          {error !== '' && <Text role="alert" accessibilityLiveRegion="assertive" style={estilos.error}>{error}</Text>}
          <Boton titulo="Recuperar compra" cargando={cargando} alPresionar={confirmarCompra} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (carrito.length === 0) {
    return (
      <SafeAreaView style={estilos.centrado}>
        <Text style={estilos.titulo}>El carrito está vacío</Text>
        <Text style={estilos.texto}>{aviso || 'Elegí un vino para comenzar tu compra.'}</Text>
        <Boton titulo="Ver catálogo" alPresionar={() => navegacion.replace('/')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={estilos.flexible} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo}>Tu carrito</Text>
          <Boton titulo="Actualizar precios y stock" secundario deshabilitado={cargando} alPresionar={actualizarCarrito} />
          {aviso !== '' && <Text role="status" accessibilityLiveRegion="polite" style={estilos.texto}>{aviso}</Text>}
          {carrito.map((articulo) => (
            <View key={articulo.id} style={estilos.tarjeta}>
              <View style={estilos.fila}>
                <ImagenProducto producto={articulo} style={estilos.imagenCarrito} />
                <View style={estilos.flexible}>
                  <Text style={estilos.subtitulo}>{articulo.nombre}</Text>
                  <Text style={estilos.texto}>{mostrarPrecio(articulo.precio)} por unidad</Text>
                </View>
              </View>
              <View style={estilos.controles}>
                <Boton titulo="−" etiqueta={`Disminuir cantidad de ${articulo.nombre}`} secundario
                  deshabilitado={cargando} alPresionar={() => cambiarCantidad(articulo.id, articulo.cantidad - 1)} />
                <Text accessibilityLabel={`Cantidad: ${articulo.cantidad}`} accessibilityLiveRegion="polite" style={estilos.subtitulo}>{articulo.cantidad}</Text>
                <Boton titulo="+" etiqueta={`Aumentar cantidad de ${articulo.nombre}`} secundario
                  deshabilitado={cargando || articulo.cantidad >= Math.min(articulo.stock, 99)}
                  alPresionar={() => cambiarCantidad(articulo.id, articulo.cantidad + 1)} />
              </View>
              <Text style={estilos.precio}>{mostrarPrecio(articulo.precio * articulo.cantidad)}</Text>
              <Boton titulo="Eliminar" etiqueta={`Eliminar ${articulo.nombre} del carrito`} secundario
                deshabilitado={cargando} alPresionar={() => eliminarProducto(articulo.id)} />
            </View>
          ))}
          <Boton titulo="Vaciar carrito" secundario deshabilitado={cargando} alPresionar={vaciarCarrito} />
          <Text style={estilos.precio}>Total a pagar: {mostrarPrecio(total)}</Text>
          <View style={estilos.tarjeta}>
            <Text style={estilos.subtitulo}>Datos de la compra</Text>
            <Text style={estilos.texto}>Todos los campos son obligatorios. Usá datos ficticios; no ingreses datos bancarios reales.</Text>
            <Campo etiqueta="Nombre y apellido" valor={nombre} alCambiar={cambiarNombre} ayuda="Ej. Ana Prueba"
              minimo={3} validar={validar} editable={!cargando} />
            <Campo etiqueta="Dirección" valor={direccion} alCambiar={cambiarDireccion} ayuda="Calle, número y localidad"
              minimo={5} validar={validar} limite={200} editable={!cargando} />
            <Text style={estilos.etiqueta}>Método de pago</Text>
            <Boton titulo={`Tarjeta de prueba${metodo === 'tarjeta' ? ' · seleccionada' : ''}`} secundario
              seleccionado={metodo === 'tarjeta'} deshabilitado={cargando} alPresionar={() => cambiarMetodo('tarjeta')} />
            <Boton titulo={`Transferencia${metodo === 'transferencia' ? ' · seleccionada' : ''}`} secundario
              seleccionado={metodo === 'transferencia'} deshabilitado={cargando} alPresionar={() => cambiarMetodo('transferencia')} />
            <Campo etiqueta={metodo === 'tarjeta' ? 'Referencia ficticia de tarjeta' : 'Alias ficticio'}
              valor={referencia} alCambiar={cambiarReferencia} ayuda="Ej. TEST-1234" minimo={3}
              validar={validar} limite={80} editable={!cargando} />
            {error !== '' && <Text role="alert" accessibilityLiveRegion="assertive" style={estilos.error}>{error}</Text>}
            <Boton titulo="Confirmar y pagar" cargando={cargando} alPresionar={confirmarCompra} />
          </View>
          <Boton titulo="Seguir comprando" secundario deshabilitado={cargando} alPresionar={() => navegacion.replace('/')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
