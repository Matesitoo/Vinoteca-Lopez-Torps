import Filtro from '../componentes/Filtro';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, ScrollView, Text, TextInput, View } from 'react-native';
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

  useFocusEffect(useCallback(() => {
    let activo = true;
    cambiarCarga(true);
    consultarApi('/productos')
      .then((datos) => { if (activo) { actualizarProductos(datos); cambiarError(''); } })
      .catch((problema) => { if (activo) cambiarError(problema.message); })
      .finally(() => { if (activo) cambiarCarga(false); });
    return () => { activo = false; };
  }, []));

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
            <Text style={estilos.texto}>{productos.length} vinos para descubrir · Precios de demostración en pesos argentinos.</Text>
            <Boton titulo={`Ver carrito (${cantidadTotal})`} alPresionar={() => navegacion.push('/carrito')} />
            <TextInput
              style={estilos.entrada}
              placeholder="Buscar un vino"
              placeholderTextColor="#68545D"
              accessibilityLabel="Buscar un vino"
              value={busqueda}
              onChangeText={cambiarBusqueda}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
              {categorias.map((nombre) => (
                <Filtro key={nombre} nombre={nombre} seleccionado={categoria === nombre}
                  alPresionar={() => cambiarCategoria(nombre)} />
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
            <Text accessibilityLiveRegion="polite" role={error ? 'alert' : 'status'} style={error ? estilos.error : estilos.texto}>
              {error || 'No hay vinos que coincidan con tu búsqueda.'}
            </Text>
          )
        }
        ListFooterComponent={<Text style={estilos.texto}>Trabajo práctico · Todos los pagos son simulados.</Text>}
      />
    </SafeAreaView>
  );
}
