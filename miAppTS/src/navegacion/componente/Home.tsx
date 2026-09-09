import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import React from "react";

export default function Home() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botonTexto}>
        <Text style={styles.textoBoton}>Texto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonInput}>
        <Text style={styles.textoBoton}>Input</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonBoton}>
        <Text style={styles.textoBoton}>Boton</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonLista}>
        <Text style={styles.textoBoton}>Lista</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonModal}>
        <Text style={styles.textoBoton}>Modal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  botonTexto: {
    backgroundColor: "#05A5F0",
    width: 100,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  textoBoton: {
    color: "#010D13",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  botonInput: {
    backgroundColor: "#05A5F0",
    width: 100,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonBoton: {
    backgroundColor: "#05A5F0",
    width: 100,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonLista: {
    backgroundColor: "#05A5F0",
    width: 100,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonModal: {
    backgroundColor: "#05A5F0",
    width: 100,
    padding: 15,
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
