import { useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { estilos } from '../estilos/estilos';

export default function Boton({
  titulo, alPresionar, deshabilitado = false, cargando = false,
  secundario = false, etiqueta, seleccionado,
}) {
  const [enfocado, cambiarFoco] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta || titulo}
      accessibilityState={{ disabled: deshabilitado || cargando, busy: cargando, selected: seleccionado }}
      onPress={alPresionar}
      onFocus={() => cambiarFoco(true)}
      onBlur={() => cambiarFoco(false)}
      disabled={deshabilitado || cargando}
      style={({ pressed }) => [
        estilos.boton,
        secundario && estilos.botonSecundario,
        (deshabilitado || cargando) && estilos.botonDeshabilitado,
        pressed && estilos.presionado,
        enfocado && estilos.enfocado,
      ]}
    >
      {cargando && <ActivityIndicator color={secundario ? '#782E47' : 'white'} />}
      <Text style={[estilos.textoBoton, secundario && !deshabilitado && !cargando && estilos.textoBotonSecundario]}>
        {cargando ? 'Procesando…' : titulo}
      </Text>
    </Pressable>
  );
}
