import { useContext, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContextoCarrito } from '../../contexto/ContextoCarrito';
import { consultarApi, mostrarPrecio } from '../../configuracion/api';
import { estilos } from '../../estilos/estilos';
import Boton from '../../componentes/Boton';

export default function Detalle() {
  // El id viene de la URL, como en el trabajo de octubre.
  const { id } = useLocalSearchParams();
  const navegacion = useRouter();
  const { carrito, agregarProducto } = useContext(ContextoCarrito);
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

  useEffect(() => {
    cargarProducto(id);
    // Volvemos a consultar cuando cambia el parámetro de la ruta.
  }, [id]);

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
        <Image source={{ uri: producto.imagen }} style={[estilos.imagen, estilos.imagenDetalle]} />
        <Text style={estilos.etiqueta}>{producto.categoria}</Text>
        <Text style={estilos.titulo}>{producto.nombre}</Text>
        <Text style={estilos.precio}>{mostrarPrecio(producto.precio)}</Text>
        <Text style={estilos.texto}>{producto.stock} botellas disponibles · 750 ml</Text>
        <View style={estilos.bloque}>
          <Text style={estilos.subtitulo}>Origen y notas de cata</Text>
          <Text style={estilos.texto}>{producto.descripcion}</Text>
        </View>
        <Boton
          titulo={sinDisponibilidad ? 'Sin más unidades disponibles' : 'Agregar al carrito'}
          deshabilitado={sinDisponibilidad}
          alPresionar={() => {
            agregarProducto(producto);
            cambiarAgregado(true);
            Alert.alert('Carrito', 'Vino agregado al carrito.');
          }}
        />
        {agregado && <Text style={estilos.texto}>Agregado al carrito. Cantidad: {cantidad}.</Text>}
        <Boton titulo="Ver carrito" secundario alPresionar={() => navegacion.push('/carrito')} />
      </ScrollView>
    </SafeAreaView>
  );
}
