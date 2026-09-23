import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import Menu from "./Menu";
import { useFocusEffect } from "@react-navigation/native";
import { inicializarBaseDatos } from "../../database/database";

type Compra = {
  id: number;
  idCliente: number;
  fecha: string;
  total: number;
  nombre: string;
  apellido: string;
  correo: string;
};

export default function ComprasAdmin({ navigation }: any) {
  const [compras, setCompras] = useState<Compra[]>([]);

  const cargarCompras = async () => {
    try {
      const db = await inicializarBaseDatos();

      const resultado = await db.getAllAsync<Compra>(
        `
        SELECT
          Encabezado.id,
          Encabezado.idCliente,
          Encabezado.fecha,
          Encabezado.total,
          Cliente.nombre,
          Cliente.apellido,
          Cliente.correo
        FROM Encabezado
        INNER JOIN Cliente
          ON Encabezado.idCliente = Cliente.id
        ORDER BY Encabezado.id DESC
        `,
      );

      setCompras(resultado);
    } catch (error) {
      console.log("Error cargando compras:", error);

      Alert.alert("Error", "No se pudieron cargar las compras");
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCompras();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Menu navigation={navigation} tipo="ADMIN" />
      <Text style={styles.titulo}>Compras realizadas</Text>

      {compras.length === 0 ? (
        <Text style={styles.sinCompras}>No hay compras registradas.</Text>
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.numeroCompra}>Compra #{item.id}</Text>

              <Text style={styles.texto}>
                Cliente: {item.nombre} {item.apellido}
              </Text>

              <Text style={styles.texto}>Correo: {item.correo}</Text>

              <Text style={styles.texto}>
                Fecha:{" "}
                {item.fecha
                  ? new Date(item.fecha).toLocaleString()
                  : "Sin fecha"}
              </Text>

              <Text style={styles.total}>Total: ${item.total}</Text>

              <TouchableOpacity
                style={styles.boton}
                onPress={() =>
                  navigation.navigate("DetallesAdmin", {
                    idEncabezado: item.id,
                  })
                }
              >
                <Text style={styles.textoBoton}>VER DETALLES</Text>
              </TouchableOpacity>
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
    fontSize: 28,
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

  numeroCompra: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  texto: {
    color: "#DDDDDD",
    fontSize: 15,
    marginBottom: 5,
  },

  total: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  boton: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  textoBoton: {
    color: "black",
    fontWeight: "bold",
  },

  sinCompras: {
    color: "#CCCCCC",
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});
