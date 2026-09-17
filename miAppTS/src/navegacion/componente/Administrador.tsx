import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Administrador() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Panel de Administrador</Text>

      <Text style={styles.texto}>
        Bienvenido, tienes permisos de administrador.
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },

  texto: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
});