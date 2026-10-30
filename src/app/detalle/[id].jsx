import ImagenProducto from '../../componentes/ImagenProducto';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContextoCarrito } from '../../contexto/ContextoCarrito';
import { consultarApi, mostrarPrecio } from '../../configuracion/api';
import { estilos } from '../../estilos/estilos';
import Boton from '../../componentes/Boton';

export default function Detalle() {
  // El id viene de la URL, como en el trabajo de octubre.
  const { id } = useLocalSearchParams();
  const navegacion = useRouter();
  const { carrito, agregarProducto, pedidoPendiente, recuperando, errorAlmacenamiento } = useContext(ContextoCarrito);
  const [producto, actualizarProducto] = useState(null);
  const [cargando, cambiarCarga] = useState(true);
  const [error, cambiarError] = useState('');
  const [agregado, cambiarAgregado] = useState(false);

  function cargarProducto(idProducto) {
    return consultarApi(`/productos/${encodeURIComponent(idProducto)}`)
      .then((datos) => {
        actualizarProducto(datos);
        cambiarError('');
      })
      .catch((problema) => cambiarError(problema.message))
      .finally(() => cambiarCarga(false));
  }

  useFocusEffect(useCallback(() => {
    let activo = true;
    cambiarCarga(true);
    cambiarAgregado(false);
    consultarApi(`/productos/${encodeURIComponent(id)}`)
      .then((datos) => { if (activo) { actualizarProducto(datos); cambiarError(''); } })
      .catch((problema) => { if (activo) cambiarError(problema.message); })
      .finally(() => { if (activo) cambiarCarga(false); });
    return () => { activo = false; };
  }, [id]));

  if (cargando) {
    return (
      <SafeAreaView style={estilos.centrado}>
        <ActivityIndicator size="large" color="#782E47" />
      </SafeAreaView>
    );
  }

  if (error || !producto) {
    return (
      <SafeAreaView style={estilos.centrado}>
        <Text style={estilos.error}>{error || 'Producto no encontrado.'}</Text>
        <Boton
          titulo="Reintentar"
          alPresionar={() => {
            cambiarCarga(true);
            cargarProducto(id);
          }}
        />
      </SafeAreaView>
    );
  }

  const articulo = carrito.find((articulo) => articulo.id === producto.id);
  const cantidad = articulo ? articulo.cantidad : 0;
  const sinDisponibilidad = cantidad >= Math.min(producto.stock, 99);

  return (
    <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <ImagenProducto producto={producto} style={estilos.imagenDetalle} />
        <Text style={estilos.etiqueta}>{producto.categoria}</Text>
        <Text style={estilos.titulo}>{producto.nombre}</Text>
        <Text style={estilos.precio}>{mostrarPrecio(producto.precio)}</Text>
        <Text style={estilos.texto}>{producto.stock} unidades disponibles</Text>
        <View style={estilos.bloque}>
          <Text style={estilos.subtitulo}>Descripción y presentación</Text>
          <Text style={estilos.texto}>{producto.descripcion}</Text>
        </View>
        <Boton
          titulo={sinDisponibilidad ? 'Sin más unidades disponibles' : 'Agregar al carrito'}
          deshabilitado={sinDisponibilidad || Boolean(pedidoPendiente) || recuperando || Boolean(errorAlmacenamiento)}
          alPresionar={() => {
            agregarProducto(producto);
            cambiarAgregado(true);
          }}
        />
        {pedidoPendiente && <Text style={estilos.texto}>Tenés una compra pendiente. Abrí el carrito para recuperar su resultado.</Text>}
        {agregado && <Text accessibilityLiveRegion="polite" role="status" style={estilos.texto}>Agregado al carrito. Cantidad: {cantidad}.</Text>}
        <Boton titulo="Ver carrito" secundario alPresionar={() => navegacion.push('/carrito')} />
      </ScrollView>
    </SafeAreaView>
  );
}
