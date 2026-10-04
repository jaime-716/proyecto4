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

// Componente encargado de administrar
// los productos del sistema.
//
// Permite al administrador:
//
// - Crear productos.
// - Consultar inventario.
// - Editar información existente.
export default function ProductosAdmin({ navigation }: any) {

// Guarda todos los productos obtenidos
// desde la base de datos.
//
// Inicialmente empieza vacío.
// Después se llena con la consulta SQL.
  const [productos, setProductos] = useState<Producto[]>([]);

// Guarda temporalmente el nombre
// escrito por el administrador.
  const [nombre, setNombre] = useState("");

// Guarda la descripción ingresada
// del producto.
  const [descripcion, setDescripcion] = useState("");

// Guarda el valor del producto
// mientras el administrador escribe.
//
// Se almacena como texto porque viene
// directamente desde un TextInput.
  const [valorUnitario, setValorUnitario] = useState("");

// Guarda temporalmente la cantidad
// disponible del producto.
  const [stock, setStock] = useState("");

// Guarda el identificador del producto
// que se está modificando.
//
// null significa que no existe
// ningún producto seleccionado.
//
// Cuando tiene un id,
// el botón cambia de:
//
// GUARDAR PRODUCTO
//
// a:
//
// ACTUALIZAR PRODUCTO
  const [productoEditar, setProductoEditar] = useState<number | null>(null);

// Función encargada de consultar
// todos los productos almacenados
// en SQLite.
  const cargarProductos = async () => {
    try {
      const db = await inicializarBaseDatos();

// Consulta todos los productos
// registrados en la tabla Producto.
//
// ORDER BY nombre ASC:
// Organiza los productos
// alfabéticamente.
      const resultado = await db.getAllAsync<Producto>(
        `
        SELECT *
        FROM Producto
        ORDER BY nombre ASC
        `,
      );

// Guarda la información obtenida
// dentro del estado.
//
// React actualiza automáticamente
// la lista mostrada en pantalla.
      setProductos(resultado);

// Controla errores durante:
//
// - conexión con SQLite.
// - consulta SQL.
// - problemas con la tabla Producto.
    } catch (error) {
      console.log("Error cargando productos:", error);

      Alert.alert("Error", "No se pudieron cargar los productos");
    }
  };

// Función encargada de crear
// o actualizar productos.
//
// Si existe productoEditar:
// actualiza.
//
// Si no existe:
// crea un nuevo producto.
  const guardarProducto = async () => {

// Elimina espacios innecesarios
// antes de guardar información.
//
// Ejemplo:
//
// "  Mouse  "
//
// queda:
//
// "Mouse"
    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descripcion.trim();

// Verifica que los campos necesarios tengan informacion
// no permite guardar productos incompletos
    if (nombreLimpio === "" || valorUnitario === "" || stock === "") {
      Alert.alert("Error", "Completa los campos obligatorios");

      return;
    }

// Comprueba el precio, que un numero sea mayor a cero y sea un numero
    const valor = Number(valorUnitario);
    const cantidadStock = Number(stock);

// Valida el stock: que sea un numero y no sea negativo
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

// si existe un id seleccionado, significa
// que el admon esta editando un producto
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

// Si no existe ProductoEditar, significa que se esta creando un nuevo producto
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

// Limpia los campos despues de guardar
// Tambien elimina la seleccion de edicion para volver al modo crear
      setNombre("");
      setDescripcion("");
      setValorUnitario("");
      setStock("");
      setProductoEditar(null);

      cargarProductos();
    } catch (error: any) {
  console.log("ERROR COMPLETO:", error);

  Alert.alert(
    "Error",
    error?.message || "No se pudo guardar el producto"
  );
}

// Funcion ejecutada cuando el Admon presiona el boton editar
  const seleccionarProducto = (producto: Producto) => {

// Guarda el id del producto seleccionado
// Esto cambia el boton de 
// Guardar producto a Actualizar producto
    setProductoEditar(producto.id);

// Carga la informacion del producto
// Dentro de los cambios del formulario
// Asi el admon puede modificar los datos existentes
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setValorUnitario(producto.valorUnitario.toString());
    setStock(producto.stock.toString());
  };

// Ejecuta la consulta de productos automaticamente 
// cuando la pantalla aparece por primera vez
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
