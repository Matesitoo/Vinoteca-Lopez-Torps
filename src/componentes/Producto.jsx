import { Image, Pressable, Text } from 'react-native';
import { estilos } from '../estilos/estilos';
import { mostrarPrecio } from '../configuracion/api';

// Como Usuario en el trabajo de agosto: recibe datos y los muestra.
export default function Producto({ producto, alPresionar }) {
  return (
    <Pressable
      style={estilos.tarjeta}
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${producto.nombre}`}
    >
      <Image source={{ uri: producto.imagen }} style={estilos.imagen} />
      <Text style={estilos.etiqueta}>{producto.categoria}</Text>
      <Text style={estilos.subtitulo}>{producto.nombre}</Text>
      <Text style={estilos.precio}>{mostrarPrecio(producto.precio)}</Text>
      <Text style={estilos.texto}>{producto.stock > 0 ? `${producto.stock} botellas disponibles` : 'Sin stock'}</Text>
    </Pressable>
  );
}
