import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { estilos } from '../estilos/estilos';

export default function ImagenProducto({ producto, style }) {
  const [imagenFallida, cambiarImagenFallida] = useState(null);
  if (!producto.imagen || imagenFallida === producto.imagen) {
    return (
      <View style={[estilos.imagen, estilos.imagenAlternativa, style]} accessibilityLabel={`Imagen no disponible de ${producto.nombre}`}>
        <Text style={estilos.etiqueta}>Sin imagen</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: producto.imagen }}
      style={[estilos.imagen, style]}
      accessibilityLabel={`Imagen ilustrativa de ${producto.nombre}`}
      onError={() => cambiarImagenFallida(producto.imagen)}
    />
  );
}
