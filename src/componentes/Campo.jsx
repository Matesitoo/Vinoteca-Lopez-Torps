import { Text, TextInput, View } from 'react-native';
import { estilos } from '../estilos/estilos';

export default function Campo({ etiqueta, valor, alCambiar, ayuda, limite = 100, editable = true }) {
  return (
    <View style={estilos.formulario}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={estilos.entrada}
        accessibilityLabel={etiqueta}
        value={valor}
        onChangeText={alCambiar}
        placeholder={ayuda}
        maxLength={limite}
        editable={editable}
      />
    </View>
  );
}
