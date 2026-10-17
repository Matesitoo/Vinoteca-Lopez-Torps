import { ActivityIndicator, Pressable, Text } from 'react-native';
import { estilos } from '../estilos/estilos';

// Las props permiten reutilizar el botón en catálogo, detalle y carrito.
export default function Boton({ titulo, alPresionar, deshabilitado = false, cargando = false, secundario = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={alPresionar}
      disabled={deshabilitado || cargando}
      style={[
        estilos.boton,
        secundario && estilos.botonSecundario,
        (deshabilitado || cargando) && estilos.botonDeshabilitado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[estilos.textoBoton, secundario && estilos.textoBotonSecundario]}>{titulo}</Text>
      )}
    </Pressable>
  );
}
