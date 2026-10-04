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


// Define la estructura de información
// que tendrá cada compra consultada.
//
// Estos datos vienen principalmente
// de las tablas Encabezado y Cliente.
type Compra = {
  id: number;
  idCliente: number;
  fecha: string;
  total: number;
  nombre: string;
  apellido: string;
  correo: string;
};

// Componente encargado de mostrar al administrador
// todas las compras realizadas por los clientes.
//
// Permite consultar:
//
// - Número de compra.
// - Cliente asociado.
// - Fecha.
// - Total.
// - Detalles de productos adquiridos.
export default function ComprasAdmin({ navigation }: any) {

// Estado encargado de almacenar
// la lista de compras obtenidas desde SQLite.
//
// Inicialmente comienza vacío y luego
// se llena mediante la consulta a la base de datos.  
  const [compras, setCompras] = useState<Compra[]>([]);

// Función encargada de consultar
// todas las compras registradas.
//
// Obtiene información de dos tablas:
//
// Encabezado:
// Guarda la información general de la compra.
//
// Cliente:
// Guarda los datos del usuario que compró.
  const cargarCompras = async () => {
    try {
      const db = await inicializarBaseDatos();


// Esta consulta utiliza INNER JOIN.
//
// INNER JOIN permite unir información
// de dos tablas relacionadas.
//
// En este caso:
//
// Encabezado
//       |
//       | idCliente
//       ↓
// Cliente
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
// Guarda las compras obtenidas dentro del estado.
//
// Al cambiar este estado React actualiza
// automáticamente la pantalla mostrando
// la información nueva.
      setCompras(resultado);

    } catch (error) {
// Muestra el error en consola
  // para facilitar la búsqueda del problema.
      console.log("Error cargando compras:", error);

// Mensaje visible para el administrador.
      Alert.alert("Error", "No se pudieron cargar las compras");
    }
  };

// Ejecuta cargarCompras() cada vez que
// la pantalla vuelve a estar activa.
//
// Es útil porque si un cliente realiza
// una compra nueva, el administrador
// verá la información actualizada
// al regresar a esta pantalla.
  useFocusEffect(
    useCallback(() => {
      cargarCompras();
    }, []),
  );

  return (
// Construcción de la interfaz gráfica
// del módulo administrativo de compras.

    <View style={styles.container}>

{/*Muestra el menú general del administrador. 
Permite navegar entre los módulos administrativos.*/}
      <Menu navigation={navigation} tipo="ADMIN" />
      <Text style={styles.titulo}>Compras realizadas</Text>

{/*Verifica si existen compras registradas.
Si la lista está vacía muestra un mensaje.
Si tiene datos muestra el listado.*/}
      {compras.length === 0 ? (
        <Text style={styles.sinCompras}>No hay compras registradas.</Text>
      ) : (

// FlatList permite mostrar
// una lista dinámica de compras.
//
// Cada elemento corresponde
// a una compra almacenada en SQLite.
        <FlatList
          data={compras}

// identificador único
// para controlar cada elemento de la lista.
          keyExtractor={(item) => item.id.toString()}

// Define cómo se muestra
// cada compra en pantalla.
          renderItem={({ item }) => (

// Contenedor visual que representa
// una compra individual.
            <View style={styles.tarjeta}>

 {/*Muestra el identificador asignado a la compra.*/}
              <Text style={styles.numeroCompra}>Compra #{item.id}</Text>

 {/*Muestra quién realizó la compra.*/}
              <Text style={styles.texto}>
                Cliente: {item.nombre} {item.apellido}
              </Text>

{/*Muestra el correo asociado al cliente.*/}
              <Text style={styles.texto}>Correo: {item.correo}</Text>

{/*Convierte la fecha almacenada 
en SQLite a un formato legible.

Si no existe fecha muestra
 "Sin fecha".*/}
              <Text style={styles.texto}>
                Fecha:{" "}
                {item.fecha
                  ? new Date(item.fecha).toLocaleString()
                  : "Sin fecha"}
              </Text>

{/*Muestra el valor total de la compra realizada.*/}
              <Text style={styles.total}>Total: ${item.total}</Text>

 {/*Permite abrir la pantalla
DetallesAdmin. 

Envía el id de la compra,
para consultar los productos
asociados a esa compra.*/}
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
