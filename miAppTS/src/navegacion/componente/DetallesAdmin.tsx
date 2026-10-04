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

// Componente encargado de mostrar
// los productos asociados a una compra específica.
//
// Recibe:
// route:
// Permite obtener el identificador de la compra seleccionada.
//
// navigation:
// Permite desplazarse entre pantallas.
export default function DetallesAdmin({ route, navigation }: any) {

// Obtiene el id de la compra enviada
// desde la pantalla ComprasAdmin.
//
// Este valor permite saber qué detalles
// se deben consultar.
  const idEncabezado = route?.params?.idEncabezado;

// Almacena la lista de productos
// que pertenecen a una compra.
//
// Inicialmente comienza vacío
// y posteriormente se llena
// con información de SQLite.
  const [detalles, setDetalles] = useState<Detalle[]>([]);

// Función encargada de consultar
// los productos que forman parte
// de una compra específica.
  const cargarDetalles = async () => {
    try {
      const db = await inicializarBaseDatos();

// Esta consulta une dos tablas:
//
// Detalles:
// Contiene la información específica
// de la compra.
//
// Producto:
// Contiene la información del artículo comprado.
//
// La relación se realiza mediante:
//
// Detalles.idProducto
//          ↓
// Producto.id
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

// Guarda los detalles encontrados
// dentro del estado.
//
// Al cambiar este valor,
// React actualiza automáticamente
// la lista mostrada en pantalla.
      setDetalles(resultado);

// Controla errores durante:
// - conexión SQLite.
// - consulta SQL.
// - problemas con relaciones entre tablas.
    } catch (error) {
      console.log("Error cargando detalles:", error);

      Alert.alert("Error", "No se pudieron cargar los detalles de la compra");
    }
  };

// Ejecuta la consulta cada vez que
// la pantalla vuelve a estar activa.
//
// La dependencia idEncabezado indica
// que si cambia la compra seleccionada,
// debe volver a cargar la información.
  useFocusEffect(
    useCallback(() => {
      cargarDetalles();
    }, [idEncabezado]),
  );

// Ejecuta la consulta cada vez que
// la pantalla vuelve a estar activa.
//
// La dependencia idEncabezado indica
// que si cambia la compra seleccionada,
// debe volver a cargar la información.
  return (
    <View style={styles.container}>

{/*Muestra el menú general del administrador. */}
      <Menu navigation={navigation} tipo="ADMIN" />

{/*Muestra el número de la compra  que se está consultando.*/}
      <Text style={styles.titulo}>Detalle compra #{idEncabezado}</Text>

{/* Verifica si la compra tiene productos registrados.
Si no existen detalles muestra un mensaje.
 Si existen muestra la lista.*/}
      {detalles.length === 0 ? (
        <Text style={styles.sinDetalles}>No hay detalles registrados.</Text>
      ) : (

// Muestra todos los productos
// pertenecientes a la compra seleccionada.
        <FlatList
          data={detalles}
          keyExtractor={(item) => item.id.toString()}

// Define cómo se representa
// cada producto dentro del detalle.
          renderItem={({ item }) => (

// Contenedor visual individual
// para cada producto comprado.
            <View style={styles.tarjeta}>

{/*Muestra el nombre del producto. */}
              <Text style={styles.nombre}>{item.nombre}</Text>

{/*Muestra información adicional  del producto comprado.*/}
              <Text style={styles.texto}>Descripción: {item.descripcion}</Text>

{/*Muestra el precio individual 
de cada unidad.*/}
              <Text style={styles.texto}>
                Valor unitario: ${item.valorUnitario}
              </Text>

{/* Indica cuántas unidades
fueron compradas.*/}
              <Text style={styles.texto}>Cantidad: {item.cantidad}</Text>

{/*Muestra el valor total de ese producto dentro de la compra. */}
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
