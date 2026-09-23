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
    const correoLimpio = correo.trim().toLowerCase();

    if (correo === "" || password === "") {
      Alert.alert("Error", "Debes llenar todos los campos");
      return;
    }

    // Validar formato del correo
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!expresionCorreo.test(correoLimpio)) {
      Alert.alert("Error", "Ingresa un correo electrónico válido");
      return;
    }

    // Validar contraseña
    const expresionPassword = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!expresionPassword.test(password)) {
      Alert.alert(
        "Error",
        "La contraseña debe tener mínimo 6 caracteres e incluir letras y números",
      );
      return;
    }

    try {
      const db = await inicializarBaseDatos();

      // Revisar si el correo ya está registrado
      const usuarioExistente = await db.getFirstAsync(
        "SELECT id FROM usuarios WHERE correo = ?",
        correoLimpio,
      );

      if (usuarioExistente) {
        Alert.alert("Error", "Ya existe una cuenta registrada con este correo");
        return;
      }

      // Crear usuario pendiente
      await db.runAsync(
        `INSERT INTO usuarios
       (correo, password, estado, rol)
       VALUES (?, ?, ?, ?)`,
        correoLimpio,
        password,
        "PENDIENTE",
        null,
      );

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta fue creada y se encuentra pendiente de aprobación por un administrador.",
      );

      setCorreo("");
      setPassword("");
    } catch (error) {
      console.log("ERROR REAL:", error);

      Alert.alert("Error", "Ocurrió un error al registrar el usuario");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro</Text>
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
          <Text style={styles.textoBoton}>REGISTRARSE</Text>
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
    backgroundColor: "#070707",
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
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
    height: 50,
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

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
  },
});
