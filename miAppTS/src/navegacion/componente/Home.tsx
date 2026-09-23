import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Menu from "./Menu";

export default function Home({ navigation, route }: any) {
  const usuarioId = route?.params?.usuarioId;
  const correo = route?.params?.correo;

  return (
    <View style={styles.container}>
      <Menu
        navigation={navigation}
        tipo="CLIENTE"
        usuarioId={usuarioId}
        correo={correo}
      />

      <View style={styles.contenido}>
        <Text style={styles.titulo}>Inicio</Text>

        <Text style={styles.subtitulo}>Bienvenido</Text>

        <Text style={styles.mensaje}>
          Desde el menú puedes consultar tu perfil y realizar tus compras.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },

  contenido: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  titulo: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitulo: {
    color: "#CCCCCC",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },

  mensaje: {
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
