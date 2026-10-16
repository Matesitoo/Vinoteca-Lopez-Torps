import { useContext, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarritoContext } from '../../context/CarritoContext';
import { URL_API, mostrarPrecio } from '../../lib/config';
import { estilos } from '../../styles/estilos';
import Boton from '../../components/Boton';

export default function Detalle() {
  // El id viene de la URL, como en el trabajo de octubre.
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { carrito, agregarProducto } = useContext(CarritoContext);
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [agregado, setAgregado] = useState(false);

  function cargarProducto(idProducto) {
    return fetch(`${URL_API}/productos/${idProducto}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se encontró el vino.');
        return respuesta.json();
      })
      .then((datos) => {
        setProducto(datos);
        setError('');
      })
      .catch((problema) => setError(problema.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarProducto(id);
    // Volvemos a consultar cuando cambia el parámetro de la ruta.
  }, [id]);

  if (cargando) {
    return <SafeAreaView style={estilos.centrado}><ActivityIndicator size="large" color="#782E47" /></SafeAreaView>;
  }

  if (error || !producto) {
    return (
      <SafeAreaView style={estilos.centrado}>
        <Text style={estilos.error}>{error || 'Producto no encontrado.'}</Text>
        <Boton titulo="Reintentar" onPress={() => { setCargando(true); cargarProducto(id); }} />
      </SafeAreaView>
    );
  }

  const item = carrito.find((item) => item.id === producto.id);
  const cantidad = item ? item.cantidad : 0;
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
          onPress={() => { agregarProducto(producto); setAgregado(true); Alert.alert('Carrito', 'Vino agregado al carrito.'); }}
        />
        {agregado && <Text style={estilos.texto}>Agregado al carrito. Cantidad: {cantidad}.</Text>}
        <Boton titulo="Ver carrito" secundario onPress={() => router.push('/carrito')} />
      </ScrollView>
    </SafeAreaView>
  );
}
