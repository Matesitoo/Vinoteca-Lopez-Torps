import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { estilos } from '../estilos/estilos';

export default function Campo({
  etiqueta, valor, alCambiar, ayuda, limite = 100, editable = true,
  minimo = 0, validar = false,
}) {
  const [tocado, cambiarTocado] = useState(false);
  const [enfocado, cambiarFoco] = useState(false);
  const error = (tocado || validar) && valor.trim().length < minimo
    ? `Completá ${etiqueta.toLowerCase()} con al menos ${minimo} caracteres.` : '';
  return (
    <View style={estilos.formulario}>
      <Text style={estilos.etiqueta}>{etiqueta} · obligatorio</Text>
      <TextInput
        style={[estilos.entrada, error && estilos.entradaError, enfocado && estilos.enfocado]}
        accessibilityLabel={`${etiqueta}, obligatorio`}
        accessibilityHint={error || `Mínimo ${minimo} caracteres.`}
        aria-invalid={Boolean(error)}
        value={valor}
        onChangeText={alCambiar}
        onFocus={() => cambiarFoco(true)}
        onBlur={() => { cambiarFoco(false); cambiarTocado(true); }}
        placeholder={ayuda}
        placeholderTextColor="#68545D"
        maxLength={limite}
        editable={editable}
      />
      {error !== '' && <Text accessibilityLiveRegion="polite" role="alert" style={estilos.error}>{error}</Text>}
    </View>
  );
}
