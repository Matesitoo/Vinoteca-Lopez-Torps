import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import { consultarApi } from '../configuracion/api';
import { estilos } from '../estilos/estilos';
import Producto from '../componentes/Producto';
import Boton from '../componentes/Boton';

export default function Catalogo() {
  const navegacion = useRouter();
  const { cantidadTotal } = useContext(ContextoCarrito);
  const [productos, actualizarProductos] = useState([]);
  const [cargando, cambiarCarga] = useState(true);
  const [error, cambiarError] = useState('');
  const [busqueda, cambiarBusqueda] = useState('');
  const [categoria, cambiarCategoria] = useState('Todos');

  function cargarProductos() {
    return consultarApi('/productos')
      .then((datos) => {
        actualizarProductos(datos);
        cambiarError('');
      })
      .catch((problema) => cambiarError(problema.message))
      .finally(() => cambiarCarga(false));
  }

  // Igual que en el trabajo de la NASA: consultar la API al montar la pantalla.
  useEffect(() => {
    cargarProductos();
  }, []);

  const categorias = ['Todos', ...new Set(productos.map((producto) => producto.categoria))];
  const filtrados = productos.filter((producto) => {
    const coincideCategoria = categoria === 'Todos' || producto.categoria === categoria;
    const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideNombre;
  });

  return (
    <SafeAreaView style={estilos.pantalla} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={cargando || error ? [] : filtrados}
        keyExtractor={(articulo) => articulo.id.toString()}
        contentContainerStyle={estilos.contenido}
        renderItem={({ item: articulo }) => (
          <Producto
            producto={articulo}
            alPresionar={() => navegacion.push({ pathname: '/detalle/[id]', params: { id: articulo.id } })}
          />
        )}
        ListHeaderComponent={
          <View style={estilos.formulario}>
            <Text style={estilos.titulo}>Cada vino, una historia.</Text>
            <Text style={estilos.texto}>{productos.length} vinos para descubrir · Precios en pesos argentinos.</Text>
            <Boton titulo={`Ver carrito (${cantidadTotal})`} alPresionar={() => navegacion.push('/carrito')} />
            <TextInput
              style={estilos.entrada}
              placeholder="Buscar un vino"
              accessibilityLabel="Buscar un vino"
              value={busqueda}
              onChangeText={cambiarBusqueda}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
              {categorias.map((nombre) => (
                <Pressable
                  key={nombre}
                  onPress={() => cambiarCategoria(nombre)}
                  style={[estilos.filtro, categoria === nombre && estilos.filtroActivo]}
                >
                  <Text style={[estilos.etiqueta, categoria === nombre && estilos.textoFiltroActivo]}>{nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Boton
              titulo="Actualizar catálogo"
              secundario
              deshabilitado={cargando}
              alPresionar={() => {
                cambiarCarga(true);
                cargarProductos();
              }}
            />
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <ActivityIndicator size="large" color="#782E47" />
          ) : (
            <Text style={error ? estilos.error : estilos.texto}>
              {error || 'No hay vinos que coincidan con tu búsqueda.'}
            </Text>
          )
        }
        ListFooterComponent={<Text style={estilos.texto}>Trabajo práctico · Todos los pagos son simulados.</Text>}
      />
    </SafeAreaView>
  );
}
