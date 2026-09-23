import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import Menu from "./Menu";
import { inicializarBaseDatos } from "../../database/database";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  valorUnitario: number;
  stock: number;
};

export default function ProductosAdmin({ navigation }: any) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [stock, setStock] = useState("");
  const [productoEditar, setProductoEditar] = useState<number | null>(null);
  // Cargar productos desde SQLite
  const cargarProductos = async () => {
    try {
      const db = await inicializarBaseDatos();

      const resultado = await db.getAllAsync<Producto>(
        `
        SELECT *
        FROM Producto
        ORDER BY nombre ASC
        `,
      );

      setProductos(resultado);
    } catch (error) {
      console.log("Error cargando productos:", error);

      Alert.alert("Error", "No se pudieron cargar los productos");
    }
  };

  // Guardar producto
  const guardarProducto = async () => {
    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descripcion.trim();

    if (nombreLimpio === "" || valorUnitario === "" || stock === "") {
      Alert.alert("Error", "Completa los campos obligatorios");

      return;
    }

    const valor = Number(valorUnitario);
    const cantidadStock = Number(stock);

    if (isNaN(valor) || valor <= 0) {
      Alert.alert("Error", "El valor debe ser un número mayor a cero");

      return;
    }

    if (
      isNaN(cantidadStock) ||
      cantidadStock < 0 ||
      !Number.isInteger(cantidadStock)
    ) {
      Alert.alert(
        "Error",
        "El stock debe ser un número entero mayor o igual a cero",
      );

      return;
    }

    try {
      const db = await inicializarBaseDatos();

      if (productoEditar) {
        await db.runAsync(
          `
      UPDATE Producto
      SET nombre = ?,
          descripcion = ?,
          valorUnitario = ?,
          stock = ?
      WHERE id = ?
      `,
          nombreLimpio,
          descripcionLimpia,
          valor,
          cantidadStock,
          productoEditar,
        );

        Alert.alert("Éxito", "Producto actualizado correctamente");
      } else {
        await db.runAsync(
          `
      INSERT INTO Producto
      (
        nombre,
        descripcion,
        valorUnitario,
        stock
      )
      VALUES (?, ?, ?, ?)
      `,
          nombreLimpio,
          descripcionLimpia,
          valor,
          cantidadStock,
        );

        Alert.alert("Éxito", "Producto creado correctamente");
      }

      setNombre("");
      setDescripcion("");
      setValorUnitario("");
      setStock("");
      setProductoEditar(null);

      cargarProductos();
    } catch (error) {
      console.log("Error guardando producto:", error);

      Alert.alert("Error", "No se pudo guardar el producto");
    }
  };
  const seleccionarProducto = (producto: Producto) => {
    setProductoEditar(producto.id);

    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setValorUnitario(producto.valorUnitario.toString());
    setStock(producto.stock.toString());
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <View style={styles.container}>
      <Menu navigation={navigation} tipo="ADMIN" />
      <Text style={styles.titulo}>Gestión de Productos</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={styles.input}
        placeholder="Valor unitario"
        keyboardType="numeric"
        value={valorUnitario}
        onChangeText={setValorUnitario}
      />

      <TextInput
        style={styles.input}
        placeholder="Stock"
        keyboardType="numeric"
        value={stock}
        onChangeText={setStock}
      />

      <TouchableOpacity style={styles.boton} onPress={guardarProducto}>
        <Text style={styles.textoBoton}>
          {productoEditar ? "ACTUALIZAR PRODUCTO" : "GUARDAR PRODUCTO"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.nombre}>{item.nombre}</Text>

            <Text style={styles.texto}>Descripción: {item.descripcion}</Text>

            <Text style={styles.texto}>Valor: ${item.valorUnitario}</Text>

            <Text style={styles.texto}>Stock: {item.stock}</Text>
            <TouchableOpacity
              style={styles.boton}
              onPress={() => seleccionarProducto(item)}
            >
              <Text style={styles.textoBoton}>EDITAR</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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

  input: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  boton: {
    backgroundColor: "white",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  textoBoton: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
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
  },

  texto: {
    color: "#DDDDDD",
    marginTop: 5,
  },
});
