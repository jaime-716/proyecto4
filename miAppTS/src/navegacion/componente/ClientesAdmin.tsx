import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import Menu from "./Menu";
import { useFocusEffect } from "@react-navigation/native";
import { inicializarBaseDatos } from "../../database/database";

type Cliente = {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  fecha: string;
};

export default function ClientesAdmin({ navigation }: any) {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const cargarClientes = async () => {
    try {
      const db = await inicializarBaseDatos();

      const resultado = await db.getAllAsync<Cliente>(
        `SELECT id, idUsuario, nombre, apellido, correo, fecha
         FROM Cliente
         ORDER BY nombre ASC`,
      );

      setClientes(resultado);
    } catch (error) {
      console.log("Error cargando clientes:", error);

      Alert.alert("Error", "No se pudo cargar el listado de clientes");
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarClientes();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Menu navigation={navigation} tipo="ADMIN" />
      <Text style={styles.titulo}>Clientes registrados</Text>

      {clientes.length === 0 ? (
        <Text style={styles.sinClientes}>No hay clientes registrados.</Text>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>
                {item.nombre} {item.apellido}
              </Text>

              <Text style={styles.texto}>Correo: {item.correo}</Text>

              <Text style={styles.texto}>ID Cliente: {item.id}</Text>

              <Text style={styles.texto}>
                Fecha:{" "}
                {item.fecha
                  ? new Date(item.fecha).toLocaleDateString()
                  : "Sin fecha"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },

  titulo: {
    color: "white",
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },

  tarjeta: {
    backgroundColor: "#424242",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
  },

  nombre: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
  },

  texto: {
    color: "#DDDDDD",
    fontSize: 15,
    marginBottom: 5,
  },

  sinClientes: {
    color: "#CCCCCC",
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});
