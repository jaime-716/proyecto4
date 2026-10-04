import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

// Importa el menú reutilizable del administrador.
import Menu from "./Menu";

// Importa la función que inicializa la base de datos SQLite.
import { inicializarBaseDatos } from "../../database/database";

// Define la estructura de un usuario.
// Se utiliza para indicar qué datos tendrá cada usuario pendiente.
type Usuario = {
  id: number;
  correo: string;
  estado: string;
  rol: string | null;
};

// Componente principal del panel administrador.
// Recibe navigation para poder desplazarse entre pantallas.
export default function Administrador({ navigation }: any) {
  // Estado que almacena la lista de usuarios pendientes de aprobación.
  const [usuariosPendientes, setUsuariosPendientes] = useState<Usuario[]>([]);

  // Función encargada de consultar en SQLite
  // los usuarios que todavía no han sido aprobados.
  const cargarUsuariosPendientes = async () => {
    // Abre la conexión con la base de datos.
    try {
      const db = await inicializarBaseDatos();

      // Consulta los usuarios que se encuentarn PENDIENTE.
      const usuarios = await db.getAllAsync<Usuario>(
        `SELECT id, correo, estado, rol
         FROM usuarios
         WHERE estado = ?
         ORDER BY id DESC`,
        "PENDIENTE",
      );

      // Guarda los usuarios encontrados en el estado.
      setUsuariosPendientes(usuarios);
    } catch (error) {
      // Muestra el error en consola si falla la consulta.
      console.log("Error cargando usuarios:", error);

      // Mensaje visible para el administrador.
      Alert.alert("Error", "No se pudieron cargar los usuarios pendientes");
    }
  };

  // Función utilizada para activar un usuario.
  // Cambia su estado a ACTIVO y asigna un rol.
  const activarUsuario = async (id: number, rol: "ADMIN" | "CLIENTE") => {
    try {
      // Obtiene la conexión a SQLite.
      const db = await inicializarBaseDatos();

      // Actualiza el usuario seleccionado.
      await db.runAsync(
        `UPDATE usuarios
         SET estado = ?, rol = ?
         WHERE id = ?`,
        "ACTIVO",
        rol,
        id,
      );

      // Informa que la operación fue exitosa.
      Alert.alert(
        "Usuario activado",
        `La cuenta fue activada con el rol ${rol}`,
      );

      // Recarga la lista para actualizar la pantalla.
      cargarUsuariosPendientes();
    } catch (error) {
      console.log("Error activando usuario:", error);

      Alert.alert("Error", "No se pudo activar el usuario");
    }
  };

  // Muestra una ventana de confirmación antes de activar un usuario.
  const confirmarActivacion = (usuario: Usuario, rol: "ADMIN" | "CLIENTE") => {
    Alert.alert(
      "Confirmar activación",
      `¿Deseas activar a ${usuario.correo} como ${rol}?`,
      [
        {
          // Botón cancelar.
          text: "Cancelar",
          style: "cancel",
        },
        {
          // Botón confirmar.
          text: "Activar",
          onPress: () => activarUsuario(usuario.id, rol),
        },
      ],
    );
  };

  // Ejecuta la carga de usuarios cuando la pantalla inicia.
  useEffect(() => {
    cargarUsuariosPendientes();
  }, []);

  // Parte visual de la pantalla.
  return (
    <View style={styles.container}>

{/*Menú general del administrador. */}
      <Menu navigation={navigation} tipo="ADMIN" />

{/*Título principal. */}
      <Text style={styles.titulo}>Panel de Administrador</Text>

{/*Botón para consultar clientes registrados. */}
      <TouchableOpacity
        style={styles.botonClientes}
        onPress={() => navigation.navigate("ClientesAdmin")}
      >
        <Text style={styles.textoBotonClientes}>Ver clientes registrados</Text>
      </TouchableOpacity>
{/* Botón para administrar productos.{/* */}
      <TouchableOpacity
        style={styles.botonClientes}
        onPress={() => navigation.navigate("ProductosAdmin")}
      >
        <Text style={styles.textoBotonClientes}>Gestionar productos</Text>
      </TouchableOpacity>
{/*Botón para consultar compras realizadas. */}

      <TouchableOpacity
        style={styles.botonClientes}
        onPress={() => navigation.navigate("ComprasAdmin")}
      >
        <Text style={styles.textoBotonClientes}>Ver compras realizadas</Text>
      </TouchableOpacity>
{/*Título de la sección donde aparecen // las solicitudes de registro
      pendientes. */}
      <Text style={styles.subtitulo}>Solicitudes pendientes</Text>
      
{/*Verifica si existen usuarios pendientes. // Si la lista está vacía
      muestra un mensaje. // Si tiene datos muestra la lista. */}
      {usuariosPendientes.length === 0 ? (
        <Text style={styles.sinUsuarios}>
          No hay usuarios pendientes de aprobación.
        </Text>
      ) : (

        // FlatList permite mostrar una lista optimizada
        // de elementos obtenidos desde la base de datos.
        <FlatList

          // Lista de usuarios pendientes.
          style={styles.lista}
          data={usuariosPendientes}

          // Identificador único para cada elemento.
          keyExtractor={(item) => item.id.toString()}

          // Define cómo se dibuja cada usuario en pantalla.
          renderItem={({ item }) => (

            // Tarjeta individual para cada solicitud.
            <View style={styles.tarjeta}>

{/* Muestra el correo del usuario registrado.*/}
              <Text style={styles.correo}>{item.correo}</Text>

{/*Muestra el estado actual del usuario. // Normalmente será PENDIENTE. */}
              <Text style={styles.estado}>Estado: {item.estado}</Text>

{/*Texto informativo para seleccionar el rol.*/}
              <Text style={styles.textoRol}>Selecciona el rol:</Text>

{/*Contenedor de los botones de asignación de rol. */}
              <View style={styles.contenedorBotones}>

{/* Botón para activar usuario como CLIENTE. */}
                <TouchableOpacity
                  style={styles.boton}
                  onPress={() => confirmarActivacion(item, "CLIENTE")}
                >
                  <Text style={styles.textoBoton}>Cliente</Text>
                </TouchableOpacity>
{/* Botón para activar usuario como ADMIN.*/}
                <TouchableOpacity
                  style={styles.boton}
                  onPress={() => confirmarActivacion(item, "ADMIN")}
                >
                  <Text style={styles.textoBoton}>Admin</Text>
                </TouchableOpacity>
              </View>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },

  lista: {
    width: "100%",
  },

  botonClientes: {
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },

  textoBotonClientes: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },

  tarjeta: {
    backgroundColor: "#424242",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#666",
  },

  correo: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  estado: {
    color: "#DDDDDD",
    fontSize: 15,
    marginBottom: 10,
  },

  textoRol: {
    color: "white",
    marginBottom: 10,
  },

  contenedorBotones: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  boton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  textoBoton: {
    color: "black",
    fontWeight: "bold",
  },

  sinUsuarios: {
    color: "#F7F3F3",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
