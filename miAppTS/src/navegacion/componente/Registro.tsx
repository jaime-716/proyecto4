import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { inicializarBaseDatos } from "../../database/database";

export default function Registro() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const registrarse = async () => {
    
    if (correo === "" || password === "") {
      Alert.alert("Error", "Debes llenar todos los campos");
      return;
    }

    try {
      // Abrimos la base de datos
      const db = await inicializarBaseDatos();
      // Guardamos el usuario
      await db.runAsync(
        "INSERT INTO usuarios (correo, password) VALUES (?, ?)",
        correo,
        password,
      );

      Alert.alert("Éxito", "Usuario registrado correctamente");

      // Limpiamos los campos
      setCorreo("");
      setPassword("");
    } catch (error) {
      console.log("ERROR REAL:", error);
      Alert.alert("Error", "Ocurrió un error al registrar");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cuadro}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },

  cuadro: {
    width: 350,
    padding: 25,
    backgroundColor: "#424242",
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },

  input: {
    width: 300,
    height: 50,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  boton: {
    width: 110,
    height: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textoBoton: {
    color: "black",
    fontSize: 14,
  },
});
