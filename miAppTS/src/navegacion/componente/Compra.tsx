import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
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

type ProductoCarrito = {
  id: number;
  nombre: string;
  valorUnitario: number;
  cantidad: number;
  stock: number;
};

export default function Compra({ route, navigation }: any) {
  const usuarioId = route?.params?.usuarioId;
  const correo = route?.params?.correo;
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [procesando, setProcesando] = useState(false);

  // Cargar productos con stock disponible
  const cargarProductos = async () => {
    try {
      const db = await inicializarBaseDatos();

      const resultado = await db.getAllAsync<Producto>(
        `
        SELECT *
        FROM Producto
        WHERE stock > 0
        ORDER BY nombre ASC
        `,
      );

      setProductos(resultado);
    } catch (error) {
      console.log("Error cargando productos:", error);

      Alert.alert("Error", "No se pudieron cargar los productos");
    }
  };

  // Agregar producto al carrito
  const agregarProducto = (producto: Producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find((item) => item.id === producto.id);

      // Si ya está agregado, aumentar cantidad
      if (existe) {
        if (existe.cantidad < existe.stock) {
          return carritoActual.map((item) =>
            item.id === producto.id
              ? {
                  ...item,
                  cantidad: item.cantidad + 1,
                }
              : item,
          );
        }

        Alert.alert("Stock insuficiente", "No hay más unidades disponibles");

        return carritoActual;
      }

      // Producto nuevo en el carrito
      return [
        ...carritoActual,
        {
          id: producto.id,
          nombre: producto.nombre,
          valorUnitario: producto.valorUnitario,
          cantidad: 1,
          stock: producto.stock,
        },
      ];
    });
  };

  // Aumentar cantidad
  const aumentarCantidad = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) => {
        if (item.id === id) {
          if (item.cantidad < item.stock) {
            return {
              ...item,
              cantidad: item.cantidad + 1,
            };
          }

          Alert.alert("Stock insuficiente", "No hay más unidades disponibles");
        }

        return item;
      }),
    );
  };

  // Disminuir cantidad
  const disminuirCantidad = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) => {
        if (item.id === id && item.cantidad > 1) {
          return {
            ...item,
            cantidad: item.cantidad - 1,
          };
        }

        return item;
      }),
    );
  };

  // Calcular total mostrado en pantalla
  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + item.valorUnitario * item.cantidad,
      0,
    );
  };

  // Confirmar y guardar la compra
  const confirmarCompra = async () => {
    if (carrito.length === 0) {
      Alert.alert("Carrito vacío", "Debes agregar al menos un producto.");
      return;
    }

    if (!usuarioId) {
      Alert.alert("Error", "No se pudo identificar el usuario.");
      return;
    }

    try {
      setProcesando(true);

      const db = await inicializarBaseDatos();

      await db.withExclusiveTransactionAsync(async (txn) => {
        // Buscar el perfil Cliente relacionado
        const cliente = await txn.getFirstAsync<{
          id: number;
        }>(
          `
            SELECT id
            FROM Cliente
            WHERE idUsuario = ?
            `,
          usuarioId,
        );

        if (!cliente) {
          throw new Error(
            "Debes completar tus datos personales antes de comprar.",
          );
        }

        // Validar nuevamente precios y stock
        const productosValidados: {
          idProducto: number;
          cantidad: number;
          subtotal: number;
        }[] = [];

        let totalCompra = 0;

        for (const item of carrito) {
          const productoActual = await txn.getFirstAsync<Producto>(
            `
                SELECT *
                FROM Producto
                WHERE id = ?
                `,
            item.id,
          );

          if (!productoActual) {
            throw new Error(`El producto ${item.nombre} ya no existe.`);
          }

          if (productoActual.stock < item.cantidad) {
            throw new Error(
              `Stock insuficiente para ${productoActual.nombre}. Disponible: ${productoActual.stock}`,
            );
          }

          const subtotal = productoActual.valorUnitario * item.cantidad;

          totalCompra += subtotal;

          productosValidados.push({
            idProducto: productoActual.id,
            cantidad: item.cantidad,
            subtotal: subtotal,
          });
        }

        // Crear Encabezado
        const fechaActual = new Date().toISOString();

        const resultadoEncabezado = await txn.runAsync(
          `
              INSERT INTO Encabezado
              (idCliente, fecha, total)
              VALUES (?, ?, ?)
              `,
          cliente.id,
          fechaActual,
          totalCompra,
        );

        const idEncabezado = resultadoEncabezado.lastInsertRowId;

        // Crear detalles y descontar stock
        for (const item of productosValidados) {
          await txn.runAsync(
            `
              INSERT INTO Detalles
              (
                idEncabezado,
                idProducto,
                cantidad,
                valor
              )
              VALUES (?, ?, ?, ?)
              `,
            idEncabezado,
            item.idProducto,
            item.cantidad,
            item.subtotal,
          );

          const resultadoStock = await txn.runAsync(
            `
                UPDATE Producto
                SET stock = stock - ?
                WHERE id = ?
                AND stock >= ?
                `,
            item.cantidad,
            item.idProducto,
            item.cantidad,
          );

          if (resultadoStock.changes === 0) {
            throw new Error("El stock cambió antes de finalizar la compra.");
          }
        }
      });

      // Si todo salió bien
      setCarrito([]);

      await cargarProductos();

      Alert.alert("Compra exitosa", "La compra fue registrada correctamente.");
    } catch (error: any) {
      console.log("ERROR CONFIRMANDO COMPRA:", error);

      Alert.alert(
        "No se pudo realizar la compra",
        error?.message || "Ocurrió un error al guardar la compra.",
      );
    } finally {
      setProcesando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
    >
      <Menu
        navigation={navigation}
        tipo="CLIENTE"
        usuarioId={usuarioId}
        correo={correo}
      />

      <Text style={styles.titulo}>Productos disponibles</Text>

      {productos.length === 0 ? (
        <Text style={styles.mensaje}>No hay productos disponibles.</Text>
      ) : (
        productos.map((item) => (
          <View style={styles.tarjeta} key={item.id}>
            <Text style={styles.nombre}>{item.nombre}</Text>

            <Text style={styles.texto}>{item.descripcion}</Text>

            <Text style={styles.texto}>Valor: ${item.valorUnitario}</Text>

            <Text style={styles.texto}>Disponible: {item.stock}</Text>

            <TouchableOpacity
              style={styles.boton}
              onPress={() => agregarProducto(item)}
            >
              <Text style={styles.textoBoton}>AGREGAR</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={styles.titulo}>Mi compra</Text>

      {carrito.length === 0 ? (
        <Text style={styles.mensaje}>No has agregado productos.</Text>
      ) : (
        carrito.map((item) => (
          <View style={styles.tarjeta} key={item.id}>
            <Text style={styles.nombre}>{item.nombre}</Text>

            <View style={styles.cantidad}>
              <TouchableOpacity
                style={styles.botonCantidad}
                onPress={() => disminuirCantidad(item.id)}
              >
                <Text style={styles.textoBoton}>-</Text>
              </TouchableOpacity>

              <Text style={styles.textoCantidad}>
                Cantidad: {item.cantidad}
              </Text>

              <TouchableOpacity
                style={styles.botonCantidad}
                onPress={() => aumentarCantidad(item.id)}
              >
                <Text style={styles.textoBoton}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.texto}>
              Subtotal: ${item.valorUnitario * item.cantidad}
            </Text>
          </View>
        ))
      )}

      {carrito.length > 0 && (
        <View style={styles.resumen}>
          <Text style={styles.total}>Total: ${calcularTotal()}</Text>

          <TouchableOpacity
            style={[
              styles.botonConfirmar,
              procesando && styles.botonDeshabilitado,
            ]}
            onPress={confirmarCompra}
            disabled={procesando}
          >
            <Text style={styles.textoBotonConfirmar}>
              {procesando ? "PROCESANDO..." : "CONFIRMAR COMPRA"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  contenido: {
    padding: 20,
    paddingBottom: 50,
  },

  titulo: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
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
    marginTop: 7,
    fontSize: 15,
  },

  mensaje: {
    color: "#CCCCCC",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },

  boton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },

  textoBoton: {
    color: "black",
    fontWeight: "bold",
  },

  cantidad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  botonCantidad: {
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },

  textoCantidad: {
    color: "white",
    fontSize: 16,
  },

  resumen: {
    backgroundColor: "#424242",
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
  },

  total: {
    color: "white",
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },

  botonConfirmar: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  botonDeshabilitado: {
    opacity: 0.5,
  },

  textoBotonConfirmar: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});
