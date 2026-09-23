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

export default function Login({ navigation }: any) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const iniciarSesion = async () => {
    const correoLimpio = correo.trim().toLowerCase();

    if (correoLimpio === "" || password === "") {
      Alert.alert("Error", "Debes llenar todos los campos");
      return;
    }

    try {
      const db = await inicializarBaseDatos();

      // Buscar únicamente por correo
      const usuario: any = await db.getFirstAsync(
        "SELECT * FROM usuarios WHERE correo = ?",
        correoLimpio,
      );

      console.log("USUARIO ENCONTRADO:", usuario);

      // El correo no existe
      if (!usuario) {
        Alert.alert("Error", "No existe un usuario registrado con este correo");
        return;
      }

      // Contraseña incorrecta
      if (usuario.password !== password) {
        Alert.alert("Error", "La contraseña es incorrecta");
        return;
      }

      console.log("ESTADO:", usuario.estado);
      console.log("ROL:", usuario.rol);

      // Usuario pendiente
      if (usuario.estado === "PENDIENTE") {
        Alert.alert(
          "Cuenta pendiente",
          "Tu cuenta está pendiente de aprobación por un administrador.",
        );
        return;
      }

      // Usuario inactivo
      if (usuario.estado === "INACTIVO") {
        Alert.alert("Cuenta inactiva", "Tu cuenta se encuentra inactiva.");
        return;
      }

      // Verificar que realmente esté activo
      if (usuario.estado !== "ACTIVO") {
        Alert.alert("Acceso denegado", "El estado de la cuenta no es válido.");
        return;
      }

      setCorreo("");
      setPassword("");

      // Acceso administrador
      if (usuario.rol === "ADMIN") {
        Alert.alert("Bienvenido", "Ingreso como administrador");
        navigation.navigate("Administrador");
        return;
      }

      // Acceso cliente
      if (usuario.rol === "CLIENTE") {
        // Buscar si ya tiene sus datos personales
        const cliente: any = await db.getFirstAsync(
          "SELECT * FROM Cliente WHERE idUsuario = ?",
          usuario.id,
        );

        // Si todavía no tiene perfil
        if (!cliente) {
          Alert.alert(
            "Completa tu perfil",
            "Antes de continuar debes registrar tus datos personales.",
          );
          console.log("CLIENTE ENCONTRADO:", cliente);

          navigation.navigate("Cliente", {
            usuarioId: usuario.id,
            correo: usuario.correo,
            primerIngreso: true,
          });

          return;
        }

        // Si ya tiene perfil
        Alert.alert("Bienvenido", `Hola ${cliente.nombre}`);

        navigation.navigate("Home", {
          usuarioId: usuario.id,
          correo: usuario.correo,
        });

        return;
      }

      // Usuario activo pero sin rol
      Alert.alert(
        "Sin rol asignado",
        "La cuenta está activa pero no tiene un rol asignado.",
      );
    } catch (error: any) {
      console.log("ERROR LOGIN:", error);

      Alert.alert("Error", error?.message || String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Iniciar sesion</Text>
      <View style={styles.cuadro}>
        <TextInput
          style={styles.input}
          placeholder="Correo"
          keyboardType="email-address"
          value={correo}
          autoCapitalize="none"
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
