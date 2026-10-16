import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarritoContext } from '../context/CarritoContext';
import { URL_API } from '../lib/config';
import { estilos } from '../styles/estilos';
import Producto from '../components/Producto';
import Boton from '../components/Boton';

export default function Index() {
  const router = useRouter();
  const { cantidadTotal } = useContext(CarritoContext);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  function cargarProductos() {
    return fetch(`${URL_API}/productos`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudo cargar el catálogo.');
        return respuesta.json();
      })
      .then((datos) => {
        setProductos(datos);
        setError('');
      })
      .catch(() => setError('No se pudo conectar. Revisá que el backend esté iniciado.'))
      .finally(() => setCargando(false));
  }

  // Igual que en el trabajo de la NASA: consultar la API al montar la pantalla.
  useEffect(() => {
    cargarProductos();
  }, []);

  const categorias = ['Todos', 'Tintos', 'Blancos', 'Rosados', 'Espumantes', 'Dulces', 'Reservas'];
  const filtrados = productos.filter((producto) => {
    const coincideCategoria = categoria === 'Todos' || producto.categoria === categoria;
    const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideNombre;
  });

  return (
    <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={cargando || error ? [] : filtrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={estilos.contenido}
        renderItem={({ item }) => (
          <Producto
            producto={item}
            onPress={() => router.push({ pathname: '/detalle/[id]', params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={
          <View style={estilos.formulario}>
            <Text style={estilos.titulo}>Cada vino, una historia.</Text>
            <Text style={estilos.texto}>20 vinos para descubrir · Precios en pesos argentinos.</Text>
            <Boton titulo={`Ver carrito (${cantidadTotal})`} onPress={() => router.push('/carrito')} />
            <TextInput
              style={estilos.entrada}
              placeholder="Buscar un vino"
              accessibilityLabel="Buscar un vino"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
              {categorias.map((nombre) => (
                <Pressable key={nombre} onPress={() => setCategoria(nombre)} style={[estilos.filtro, categoria === nombre && estilos.filtroActivo]}>
                  <Text style={[estilos.etiqueta, categoria === nombre && estilos.textoFiltroActivo]}>{nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Boton titulo="Actualizar catálogo" secundario deshabilitado={cargando} onPress={() => { setCargando(true); cargarProductos(); }} />
          </View>
        }
        ListEmptyComponent={
          cargando ? <ActivityIndicator size="large" color="#782E47" /> : (
            <Text style={error ? estilos.error : estilos.texto}>{error || 'No hay vinos que coincidan con tu búsqueda.'}</Text>
          )
        }
        ListFooterComponent={<Text style={estilos.texto}>Trabajo práctico · Todos los pagos son simulados.</Text>}
      />
    </SafeAreaView>
  );
}
