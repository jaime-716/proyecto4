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
import Ionicons from "@expo/vector-icons/Ionicons";
//<Ionicons name="eye-outline" size={24} color="black" />

export default function Login({ navigation }: any) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const iniciarSesion = async () => {
    // Verificar que los campos no estén vacíos
    if (correo === "" || password === "") {
      Alert.alert("Error", "Debes llenar todos los campos");
      return;
    }
    try {
      // Abrimos la base de datos
      const db = await inicializarBaseDatos();

      // Buscamos el usuario
      const usuario = await db.getFirstAsync(
        "SELECT * FROM usuarios WHERE correo = ? AND password = ?",
        correo,
        password,
      );

      // Si encontramos el usuario
      if (usuario) {
        Alert.alert("Éxito", "Bienvenido");
        setCorreo("");
        setPassword("");
        navigation.navigate("Home");
      } else {
        // Si no encontramos el usuario
        Alert.alert("Error", "El correo o la contraseña son incorrectos");
      }
    } catch (error) {
      console.log("Error al iniciar sesión:", error);
      Alert.alert("Error", "No se pudo iniciar sesión");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Iniciar sesion</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />
      <View style={styles.contenedorPassword}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Contraseña"
          secureTextEntry={!mostrarPassword}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => setMostrarPassword(!mostrarPassword)}
          style={styles.botonOjo}

        >
         <Ionicons
    name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
    size={24}
    color="black"
  />

        </TouchableOpacity>

      </View>

      <View style={styles.contenedorBotones}>
        <TouchableOpacity style={styles.boton} onPress={iniciarSesion}>
          <Text style={styles.textoBoton}>INGRESAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => navigation.navigate("Registro")}
        >
          <Text style={styles.registro}>REGÍSTRATE</Text>
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
    padding: 20,
    backgroundColor: "#121212",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
  },

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
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textoBoton: {
    color: "black",
  },

  botonRegistro: {
    width: 140,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
  },

  registro: {
    color: "black",
    fontSize: 14,
  },

  contenedorPassword: {
    width: 300,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 10,
    marginBottom: 15,
  },

  inputPassword: {
    flex: 1,
    height: 46,
    paddingHorizontal: 15,
  },

  verPassword: {
    marginRight: 12,
    color: "blue",
    fontWeight: "bold",
  },

  contenedorBotones: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  botonOjo: {
  padding: 10,
},

});
