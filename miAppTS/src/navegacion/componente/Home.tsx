import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import React from "react";

export default function Home() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botonTexto}>
        <Text style={styles.textoBoton}>Clientes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonInput}>
        <Text style={styles.textoBoton}>Productos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonBoton}>
        <Text style={styles.textoBoton}>Boton</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0E0B0BE5",
    flex: 1,
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 10,
    paddingTop: 30,
  },

  botonTexto: {
    backgroundColor: "white",
    width: 100,
    padding: 5,
    borderRadius: 10,
    marginBottom: 10,
  },

  textoBoton: {
    color: "#010D13",
    textAlign: "center",
    fontSize: 16,
  },

  botonInput: {
    backgroundColor: "white",
    width: 100,
    padding: 5,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonBoton: {
    backgroundColor: "white",
    width: 100,
    padding: 5,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonHome: {
    backgroundColor: "#EC1330",
    width: 250,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
