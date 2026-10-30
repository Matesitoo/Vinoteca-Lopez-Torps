import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { estilos } from '../estilos/estilos';

export default function Filtro({ nombre, seleccionado, alPresionar }) {
  const [enfocado, cambiarFoco] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionado }}
      onPress={alPresionar}
      onFocus={() => cambiarFoco(true)}
      onBlur={() => cambiarFoco(false)}
      style={[estilos.filtro, seleccionado && estilos.filtroActivo, enfocado && estilos.enfocado]}
    >
      <Text style={[estilos.etiqueta, seleccionado && estilos.textoFiltroActivo]}>{nombre}</Text>
    </Pressable>
  );
}
