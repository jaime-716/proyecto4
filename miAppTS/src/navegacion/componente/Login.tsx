import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";

export default function Login({ navigation }: any) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const iniciarSesion = () => {
    console.log("Correo:", correo);
    console.log("Contraseña:", contrasena);
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
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry={true}
        value={contrasena}
        onChangeText={setContrasena}
      />

      <View style={styles.contenedorBotones}>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate("Home")}
        >
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
    backgroundColor: "#C4C4F0",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
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
    backgroundColor: "#3120CE",
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
    backgroundColor: "#3120CE",
    borderRadius: 10,
  },

  registro: {
    color: "black",
    fontSize: 16,
  },

  contenedorBotones: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
});
