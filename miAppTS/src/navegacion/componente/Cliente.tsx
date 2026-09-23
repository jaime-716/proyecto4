import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Menu from "./Menu";

import { inicializarBaseDatos } from "../../database/database";

export default function Cliente({ route, navigation }: any) {
  const { usuarioId, correo, primerIngreso } = route.params;

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correoCliente, setCorreoCliente] = useState(correo);
  const [clienteId, setClienteId] = useState<number | null>(null);

  const cargarCliente = async () => {
    try {
      const db = await inicializarBaseDatos();

      const cliente: any = await db.getFirstAsync(
        "SELECT * FROM Cliente WHERE idUsuario = ?",
        usuarioId,
      );

      if (cliente) {
        setClienteId(cliente.id);
        setNombre(cliente.nombre);
        setApellido(cliente.apellido);
        setCorreoCliente(cliente.correo);
      }
    } catch (error) {
      console.log("Error cargando cliente:", error);
    }
  };

  useEffect(() => {
    cargarCliente();
  }, []);

  const guardarCliente = async () => {
    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();
    const correoLimpio = correoCliente.trim().toLowerCase();

    if (nombreLimpio === "" || apellidoLimpio === "" || correoLimpio === "") {
      Alert.alert("Error", "Debes completar todos los campos");
      return;
    }

    const validarCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validarCorreo.test(correoLimpio)) {
      Alert.alert("Error", "Ingresa un correo electrónico válido");
      return;
    }

    try {
      const db = await inicializarBaseDatos();

      if (clienteId) {
        // Actualizar datos
        await db.runAsync(
          `UPDATE Cliente
     SET nombre = ?, apellido = ?, correo = ?
     WHERE id = ?`,
          nombreLimpio,
          apellidoLimpio,
          correoLimpio,
          clienteId,
        );

        Alert.alert("Éxito", "Datos actualizados correctamente", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Primer registro del cliente
        const fechaActual = new Date().toISOString();

        await db.runAsync(
          `INSERT INTO Cliente
          (idUsuario, nombre, apellido, correo, fecha)
          VALUES (?, ?, ?, ?, ?)`,
          usuarioId,
          nombreLimpio,
          apellidoLimpio,
          correoLimpio,
          fechaActual,
        );

        Alert.alert(
          "Perfil creado",
          "Tus datos personales fueron registrados correctamente",
        );

        await cargarCliente();
      }

      // Si es el primer ingreso, pasa al Home
      if (primerIngreso) {
        navigation.replace("Home", {
          usuarioId,
          correo: correoLimpio,
        });
      }
    } catch (error: any) {
      console.log("ERROR CLIENTE:", error);

      Alert.alert(
        "Error",
        error?.message || "No se pudieron guardar los datos",
      );
    }
  };

  return (
    <View style={styles.container}>
      {!primerIngreso && (
        <Menu
          navigation={navigation}
          tipo="CLIENTE"
          usuarioId={usuarioId}
          correo={correoCliente}
        />
      )}

      <Text style={styles.titulo}>
        {clienteId ? "Mi Perfil" : "Completar Perfil"}
      </Text>

      {!clienteId && (
        <Text style={styles.mensaje}>
          Antes de continuar debes completar tus datos personales.
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correoCliente}
        editable={false}
      />

      <TouchableOpacity style={styles.boton} onPress={guardarCliente}>
        <Text style={styles.textoBoton}>
          {clienteId ? "Actualizar" : "Guardar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#121212",
    padding: 25,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 15,
  },

  mensaje: {
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  boton: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  textoBoton: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});
