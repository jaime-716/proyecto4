import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import Menu from "./Menu";
import { useFocusEffect } from "@react-navigation/native";
import { inicializarBaseDatos } from "../../database/database";

type Detalle = {
  id: number;
  idProducto: number;
  cantidad: number;
  valor: number;
  nombre: string;
  descripcion: string;
  valorUnitario: number;
};

export default function DetallesAdmin({ route, navigation }: any) {
  const idEncabezado = route?.params?.idEncabezado;

  const [detalles, setDetalles] = useState<Detalle[]>([]);

  const cargarDetalles = async () => {
    try {
      const db = await inicializarBaseDatos();

      const resultado = await db.getAllAsync<Detalle>(
        `
        SELECT
          Detalles.id,
          Detalles.idProducto,
          Detalles.cantidad,
          Detalles.valor,
          Producto.nombre,
          Producto.descripcion,
          Producto.valorUnitario
        FROM Detalles
        INNER JOIN Producto
          ON Detalles.idProducto = Producto.id
        WHERE Detalles.idEncabezado = ?
        ORDER BY Detalles.id ASC
        `,
        idEncabezado,
      );

      setDetalles(resultado);
    } catch (error) {
      console.log("Error cargando detalles:", error);

      Alert.alert("Error", "No se pudieron cargar los detalles de la compra");
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDetalles();
    }, [idEncabezado]),
  );

  return (
    <View style={styles.container}>
      <Menu navigation={navigation} tipo="ADMIN" />
      <Text style={styles.titulo}>Detalle compra #{idEncabezado}</Text>

      {detalles.length === 0 ? (
        <Text style={styles.sinDetalles}>No hay detalles registrados.</Text>
      ) : (
        <FlatList
          data={detalles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>{item.nombre}</Text>

              <Text style={styles.texto}>Descripción: {item.descripcion}</Text>

              <Text style={styles.texto}>
                Valor unitario: ${item.valorUnitario}
              </Text>

              <Text style={styles.texto}>Cantidad: {item.cantidad}</Text>

              <Text style={styles.subtotal}>Subtotal: ${item.valor}</Text>
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
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },

  nombre: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  texto: {
    color: "#DDDDDD",
    fontSize: 15,
    marginBottom: 5,
  },

  subtotal: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
    marginTop: 8,
  },

  sinDetalles: {
    color: "#CCCCCC",
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});
