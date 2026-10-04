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

// Define la estructura de los productos
// consultados desde la tabla Producto.
//
// Contiene la información necesaria
// para realizar una compra.
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

// Pantalla encargada del proceso de compra.
//
// Permite al cliente:
// - Visualizar productos disponibles.
// - Agregar productos al carrito.
// - Modificar cantidades.
// - Validar disponibilidad.
export default function Compra({ route, navigation }: any) {

  // Obtiene el identificador del usuario autenticado.
//
// Será utilizado posteriormente
// para relacionar la compra con el cliente.
  const usuarioId = route?.params?.usuarioId;
  const correo = route?.params?.correo;

  // productos almacena el inventario disponible.
//
// carrito almacena temporalmente
// los productos seleccionados por el cliente.
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [procesando, setProcesando] = useState(false);

  // Consulta los productos disponibles
// desde la base de datos.
  const cargarProductos = async () => {
    try {
      const db = await inicializarBaseDatos();

      // Obtiene únicamente productos
// que tienen unidades disponibles.
//
// Ordena los resultados por nombre.
      const resultado = await db.getAllAsync<Producto>(
        `
        SELECT *
        FROM Producto
        WHERE stock > 0
        ORDER BY nombre ASC
        `,
      );

      // Guarda en el estado la lista de productos obtenidos
// desde la base de datos.
// Cuando este valor cambia, React actualiza automáticamente
// la información mostrada en pantalla.
      setProductos(resultado);
    } catch (error) {

        // Captura cualquier error que ocurra durante
  // la consulta a SQLite.
      console.log("Error cargando productos:", error);

      // Muestra un mensaje visible para el usuario
  // indicando que no fue posible cargar los productos.
      Alert.alert("Error", "No se pudieron cargar los productos");
    }
  };

  // Función encargada de agregar un producto
// seleccionado por el usuario al carrito.
//
// Recibe como parámetro un producto del inventario
// que viene desde la base de datos.
  const agregarProducto = (producto: Producto) => {

     // Actualizamos el estado del carrito.
  //
  // Usamos carritoActual porque necesitamos trabajar
  // con la versión más reciente del estado.
    setCarrito((carritoActual) => {

       // Busca si el producto ya existe dentro del carrito.
    //
    // find() recorre el arreglo y devuelve el producto
    // encontrado o undefined si no existe.
      const existe = carritoActual.find((item) => item.id === producto.id);

      // Si el producto ya fue agregado anteriormente,
    // no se crea otro registro.
    // En su lugar se aumenta la cantidad.
      if (existe) {

         // Verifica que la cantidad solicitada
      // no supere el stock disponible.
        if (existe.cantidad < existe.stock) {

           // map() recorre el carrito completo.
        //
        // Cuando encuentra el producto seleccionado,
        // crea una copia actualizando solamente
        // la cantidad.
          return carritoActual.map((item) =>
            item.id === producto.id
              ? {
                  ...item,
                  cantidad: item.cantidad + 1,
                }
              : item,
          );
        }

        // Si ya llegó al límite del inventario,
      // muestra un mensaje al usuario.
        Alert.alert("Stock insuficiente", "No hay más unidades disponibles");

        // Retorna el carrito sin cambios.
        return carritoActual;
      }

      // Si el producto no existe en el carrito,
    // se agrega como un nuevo elemento.
    //
    // La cantidad inicial siempre será 1.
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

  // Función encargada de aumentar la cantidad
  // de un producto seleccionado dentro del carrito.
  //
  // Recibe el id del producto que se desea modificar.
  const aumentarCantidad = (id: number) => {

    // Actualiza el estado del carrito.
    //
    // Se utiliza carritoActual porque representa
    // la versión más reciente del estado.
    setCarrito((carritoActual) =>

       // map() permite recorrer todos los productos
      // que existen actualmente en el carrito.
      carritoActual.map((item) => {

         // Verifica si el producto actual corresponde
        // al producto que el usuario quiere aumentar.
        if (item.id === id) {

          // Valida que la nueva cantidad no supere
          // las unidades disponibles en inventario.
          if (item.cantidad < item.stock) {

             // Retorna una copia del producto actual
            // aumentando solamente la cantidad.
            //
            // El operador ...item copia todos los datos
            // existentes y modifica únicamente cantidad.
            return {
              ...item,
              cantidad: item.cantidad + 1,
            };
          }

          // Si la cantidad ya llegó al límite del stock,
          // informa al usuario que no puede agregar más unidades.
          Alert.alert("Stock insuficiente", "No hay más unidades disponibles");
        }

          // Si el producto no coincide con el seleccionado,
        // retorna el mismo producto sin modificaciones.
        return item;
      }),
    );
  };

  // Función encargada de disminuir la cantidad
  // de un producto dentro del carrito.
  const disminuirCantidad = (id: number) => {

    // Actualiza nuevamente el estado del carrito
    // utilizando la información más reciente.
    setCarrito((carritoActual) =>

       // Recorre todos los productos del carrito.
      carritoActual.map((item) => {

         // Verifica dos condiciones:
        //
        // 1. Que sea el producto seleccionado.
        // 2. Que la cantidad sea mayor a 1.
        //
        // Esto evita que la cantidad llegue a cero.
        if (item.id === id && item.cantidad > 1) {

           // Retorna una copia del producto
          // disminuyendo una unidad.
          return {
            ...item,
            cantidad: item.cantidad - 1,
          };
        }

        // Si no cumple la condición,
        // mantiene el producto sin cambios.
        return item;
      }),
    );
  };

  // Función encargada de calcular
  // el valor total de la compra actual.
  const calcularTotal = () => {

      // reduce() permite recorrer todos los productos
    // del carrito y acumular un resultado final.
    //
    // En este caso suma:
    //
    // precio del producto x cantidad comprada.
    return carrito.reduce(

      // total representa el acumulado.
      // item representa cada producto del carrito.
      (total, item) => total + item.valorUnitario * item.cantidad,

      // Valor inicial del acumulador.
      // La suma comienza desde cero.
      0,
    );
  };

   // Función encargada de validar y registrar
  // la compra completa en la base de datos.
  const confirmarCompra = async () => {

    // Primero valida que exista al menos
    // un producto seleccionado.
    if (carrito.length === 0) {

       // Evita guardar compras vacías.
      Alert.alert("Carrito vacío", "Debes agregar al menos un producto.");
      return;
    }
 // Verifica que exista un usuario identificado.
    //
    // Esto permite relacionar la compra
    // con el cliente correcto.
    if (!usuarioId) {
      Alert.alert("Error", "No se pudo identificar el usuario.");
      return;
    }

    try {

       // Cambia el estado del botón para evitar
      // múltiples registros mientras se procesa la compra.
      setProcesando(true);

      const db = await inicializarBaseDatos();

      // Inicia una transacción exclusiva.
      //
      // Una transacción permite ejecutar varias operaciones
      // como una sola unidad.
      //
      // Si algo falla, se pueden evitar datos incompletos.
      await db.withExclusiveTransactionAsync(async (txn) => {

        
        // Busca el cliente relacionado con el usuario
        // que está realizando la compra.
        //
        // La relación se hace mediante idUsuario.
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

         // Si no existe un perfil cliente,
        // no permite continuar con la compra.
        if (!cliente) {
          throw new Error(
            "Debes completar tus datos personales antes de comprar.",
          );
        }

        // Arreglo donde se almacenarán
        // los productos después de ser validados.
        //
        // Guarda:
        // - id del producto.
        // - cantidad.
        // - subtotal.
        const productosValidados: {
          idProducto: number;
          cantidad: number;
          subtotal: number;
        }[] = [];

        // Variable donde se acumula
        // el valor total de la compra.
        let totalCompra = 0;

        // Recorre cada producto seleccionado
        // en el carrito.
        for (const item of carrito) {

           // Consulta nuevamente el producto
          // directamente desde la base de datos.
          //
          // Esto evita confiar solamente en los datos
          // que tenía cargados la pantalla.
          const productoActual = await txn.getFirstAsync<Producto>(
            `
                SELECT *
                FROM Producto
                WHERE id = ?
                `,
            item.id,
          );

          // Verifica que el producto todavía exista.
          if (!productoActual) {
            throw new Error(`El producto ${item.nombre} ya no existe.`);
          }

           // Comprueba nuevamente el inventario.
          //
          // Es importante porque otro usuario
          // pudo haber comprado unidades antes.
          if (productoActual.stock < item.cantidad) {
            throw new Error(
              `Stock insuficiente para ${productoActual.nombre}. Disponible: ${productoActual.stock}`,
            );
          }

            // Calcula el subtotal del producto.
          //
          // Precio unitario x cantidad.
          const subtotal = productoActual.valorUnitario * item.cantidad;

          // Acumula el subtotal al total general.
          totalCompra += subtotal;

           // Guarda el producto validado
          // para posteriormente crear los detalles.
          productosValidados.push({
            idProducto: productoActual.id,
            cantidad: item.cantidad,
            subtotal: subtotal,
          });
        }

             // Obtiene la fecha actual
        // para registrar la compra.
        const fechaActual = new Date().toISOString();

         // Inserta la información principal
        // de la compra en la tabla Encabezado.
        //
        // Aquí se guarda:
        // - Cliente.
        // - Fecha.
        // - Total.
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

         // Guarda el identificador generado
        // para relacionarlo con los detalles.
        const idEncabezado = resultadoEncabezado.lastInsertRowId;

        // Recorre los productos validados
        // para crear los detalles de la compra.
        for (const item of productosValidados) {

           // Inserta cada producto comprado
          // en la tabla Detalles.
          //
          // Aquí queda registrada la relación:
          //
          // Compra -> Productos.
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

           // Actualiza el inventario.
          //
          // Resta del stock la cantidad comprada.
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

           // Verifica que realmente se haya actualizado
          // el inventario.
          //
          // Si no cambió ningún registro significa
          // que el stock cambió durante la compra.
          if (resultadoStock.changes === 0) {
            throw new Error("El stock cambió antes de finalizar la compra.");
          }
        }
      });

    // Limpia el carrito después de completar
      // correctamente el registro de la compra.
      //
      // De esta forma el cliente inicia una nueva compra
      // con el carrito vacío.
      setCarrito([]);

       // Vuelve a consultar los productos disponibles.
      //
      // Esto permite actualizar el stock mostrado en pantalla
      // después de descontar las unidades compradas.
      await cargarProductos();

      // Muestra un mensaje confirmando que
      // la operación terminó correctamente.
      Alert.alert("Compra exitosa", "La compra fue registrada correctamente.");
    } catch (error: any) {

       // Captura cualquier error ocurrido durante
      // el proceso completo de compra.
      console.log("ERROR CONFIRMANDO COMPRA:", error);

       // Muestra el motivo del error al usuario.
      Alert.alert(
        "No se pudo realizar la compra",
        error?.message || "Ocurrió un error al guardar la compra.",
      );
    } finally {

      // Este bloque siempre se ejecuta,
      // haya ocurrido un error o no.
      //
      // Cambia nuevamente el estado procesando
      // para habilitar el botón de compra.
      setProcesando(false);
    }
  };

  // Su función es consultar los productos
  // disponibles para mostrarlos al cliente.
  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
    >
{/* Muestra el menú general del cliente.

Recibe información del usuario autenticado
para mantener la navegación y permisos.*/}
      <Menu
        navigation={navigation}
        tipo="CLIENTE"
        usuarioId={usuarioId}
        correo={correo}
      />

{/* Identifica la sección donde el cliente
puede visualizar los productos disponibles
para comprar.*/}
      <Text style={styles.titulo}>Productos disponibles</Text>

 {/*Identifica la sección donde el cliente
puede visualizar los productos disponibles 
 para comprar.*/}
      {productos.length === 0 ? (

        // Informa al usuario que actualmente
// no existen productos con stock disponible.
        <Text style={styles.mensaje}>No hay productos disponibles.</Text>
      ) : (

        // map() recorre todos los productos
// obtenidos desde SQLite.
//
// Por cada producto crea una tarjeta visual.
        productos.map((item) => (

          // Contenedor visual individual
// para cada producto.
          <View style={styles.tarjeta} key={item.id}>

            {/*Muestra el nombre del producto. */}
            <Text style={styles.nombre}>{item.nombre}</Text>

             {/* Muestra la descripción del producto.*/}
            <Text style={styles.texto}>{item.descripcion}</Text>

            {/*Muestra el precio unitario. */}
            <Text style={styles.texto}>Valor: ${item.valorUnitario}</Text>
           
           {/*Muestra la cantidad disponible en inventario */}
            <Text style={styles.texto}>Disponible: {item.stock}</Text>

{/* Botón que envía el producto seleccionado
hacia la función agregarProducto.

Allí se valida si existe en el carrito
y si hay disponibilidad de stock.*/}
            <TouchableOpacity
              style={styles.boton}
              onPress={() => agregarProducto(item)}
            >
              <Text style={styles.textoBoton}>AGREGAR</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

{/* Título de la sección donde aparecen los productos seleccionados por el cliente.*/}
      <Text style={styles.titulo}>Mi compra</Text>

{/* Comprueba si el cliente ya agregó productos.

Si está vacío muestra un mensaje.
Si tiene productos muestra el contenido.*/}
      {carrito.length === 0 ? (
        <Text style={styles.mensaje}>No has agregado productos.</Text>
      ) : (

        // Recorre los productos seleccionados
// para mostrar:
// - nombre,
// - cantidad,
// - subtotal.
        carrito.map((item) => (
          <View style={styles.tarjeta} key={item.id}>
            <Text style={styles.nombre}>{item.nombre}</Text>

            <View style={styles.cantidad}>

{/*Reduce una unidad del producto seleccionado. */}
              <TouchableOpacity
                style={styles.botonCantidad}
                onPress={() => disminuirCantidad(item.id)}
              >
                <Text style={styles.textoBoton}>-</Text>
              </TouchableOpacity>
              
{/*Muestra cuántas unidades desea comprar el cliente. */}
              <Text style={styles.textoCantidad}>
                Cantidad: {item.cantidad}
              </Text>

{/* Aumenta una unidad validando
que no supere el stock disponible.*/}
              <TouchableOpacity
                style={styles.botonCantidad}
                onPress={() => aumentarCantidad(item.id)}
              >
                <Text style={styles.textoBoton}>+</Text>
              </TouchableOpacity>
            </View>

{/*Calcula el valor parcial del producto. 
Fórmula:
Valor unitario x cantidad.*/}
            <Text style={styles.texto}>
              Subtotal: ${item.valorUnitario * item.cantidad}
            </Text>
          </View>
        ))
      )}

{/* El resumen solamente aparece    
cuando existe al menos un producto
dentro del carrito.*/}
      {carrito.length > 0 && (
        <View style={styles.resumen}>

{/*  Ejecuta la función calcularTotal()
para mostrar el valor final
de todos los productos seleccionados.*/}
          <Text style={styles.total}>Total: ${calcularTotal()}</Text>

{/*Botón encargado de iniciar
el registro definitivo de la compra.

disabled evita que el usuario
presione varias veces mientras 
la operación está en proceso.*/}
          <TouchableOpacity
            style={[
              styles.botonConfirmar,
              procesando && styles.botonDeshabilitado,
            ]}
            onPress={confirmarCompra}
            disabled={procesando}
          >

{/*Cambia el texto según el estado, Mientras guarda: 
cuando está disponible:
CONFIRMAR COMPRA.*/}
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
