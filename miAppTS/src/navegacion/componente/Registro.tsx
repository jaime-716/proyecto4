import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const registrarse = () => {
    console.log("Nombre:", nombre);
    console.log("Correo:", correo);
    console.log("Contraseña:", password);
  };

  return (
    <View style={styles.container}>
      
      <TextInput
        style={styles.input}
        placeholder="Correo"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.boton} onPress={registrarse}>
        <Text style={styles.textoBoton}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},

  titulo: {},

  input: {
    width: 300,
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  boton: {
     width: 140,
    height: 50,
    backgroundColor: "#2ECC71",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textoBoton: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});
