import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import Menu from "./Menu";
import { useFocusEffect } from "@react-navigation/native";
import { inicializarBaseDatos } from "../../database/database";

// Define la estructura de datos
// que tendrá cada cliente consultado.
//
// Corresponde a los campos almacenados
// en la tabla Cliente de SQLite.
type Cliente = {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  fecha: string;
};

// Pantalla administrativa encargada de consultar
// y mostrar todos los clientes registrados.
//
// Permite al administrador visualizar:
// - Nombre.
// - Correo.
// - Identificador.
// - Fecha de registro.
export default function ClientesAdmin({ navigation }: any) {

  // Guarda la lista de clientes obtenidos
// desde la base de datos.
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Consulta todos los clientes registrados
// almacenados en la tabla Cliente.
  const cargarClientes = async () => {
    try {
      const db = await inicializarBaseDatos();

      // Obtiene la información de todos los clientes.
//
// Los resultados son ordenados
// alfabéticamente por nombre.
      const resultado = await db.getAllAsync<Cliente>(
        `SELECT id, idUsuario, nombre, apellido, correo, fecha
         FROM Cliente
         ORDER BY nombre ASC`,
      );

      // Actualiza el estado con los clientes encontrados
// para mostrarlos en pantalla.
      setClientes(resultado);

      // Captura errores durante la consulta
// y muestra un mensaje al administrador.
    } catch (error) {
      console.log("Error cargando clientes:", error);

      Alert.alert("Error", "No se pudo cargar el listado de clientes");
    }
  };

  // Ejecuta la consulta cada vez que
// la pantalla vuelve a estar activa.
//
// Permite actualizar la lista automáticamente
// después de registrar nuevos clientes.
  useFocusEffect(
    useCallback(() => {
      cargarClientes();
    }, []),
  );

  // Construcción de la interfaz gráfica
// del módulo de clientes administrativos.
  return (
    <View style={styles.container}>

{/*Muestra el menú general correspondiente al administrador.*/}
      <Menu navigation={navigation} tipo="ADMIN" />

{/*Título principal de la pantalla. */}
      <Text style={styles.titulo}>Clientes registrados</Text>

{/* Verifica si existen clientes registrados.

Si no hay registros muestra un mensaje.
Si existen clientes muestra la lista.*/}
      {clientes.length === 0 ? (
        <Text style={styles.sinClientes}>No hay clientes registrados.</Text>
      ) : (

        // FlatList permite mostrar
// la información de múltiples clientes
// de forma optimizada.
        <FlatList
          data={clientes}

          // Define un identificador único
// para cada elemento de la lista.
          keyExtractor={(item) => item.id.toString()}

          // Define cómo se representa
// cada cliente dentro de la lista.
          renderItem={({ item }) => (

            // Contenedor visual individual
// para cada cliente registrado.
            <View style={styles.tarjeta}>

{/* Muestra el nombre completo del cliente.*/}
              <Text style={styles.nombre}>
                {item.nombre} {item.apellido}
              </Text>

{/*Muestra el nombre completo del cliente. */}
              <Text style={styles.texto}>Correo: {item.correo}</Text>

 {/*Muestra el identificador interno
del registro en SQLite. */}
              <Text style={styles.texto}>ID Cliente: {item.id}</Text>


{/*Convierte la fecha almacenada
a un formato visible para el usuario.

Si no existe fecha muestra "Sin fecha". */}
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
