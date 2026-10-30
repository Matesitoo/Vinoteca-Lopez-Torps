import { useState } from 'react';
import ImagenProducto from './ImagenProducto';
import { Pressable, Text } from 'react-native';
import { estilos } from '../estilos/estilos';
import { mostrarPrecio } from '../configuracion/api';

// Como Usuario en el trabajo de agosto: recibe datos y los muestra.
export default function Producto({ producto, alPresionar }) {
  const [enfocado, cambiarFoco] = useState(false);
  return (
    <Pressable
      style={({ pressed }) => [estilos.tarjeta, enfocado && estilos.enfocado, pressed && estilos.presionado]}
      onFocus={() => cambiarFoco(true)}
      onBlur={() => cambiarFoco(false)}
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${producto.nombre}`}
    >
      <ImagenProducto producto={producto} />
      <Text style={estilos.etiqueta}>{producto.categoria}</Text>
      <Text style={estilos.subtitulo}>{producto.nombre}</Text>
      <Text style={estilos.precio}>{mostrarPrecio(producto.precio)}</Text>
      <Text style={estilos.texto}>{producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Sin stock'}</Text>
    </Pressable>
  );
}
