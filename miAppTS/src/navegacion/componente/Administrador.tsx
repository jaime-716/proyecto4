import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import Menu from "./Menu";

import { inicializarBaseDatos } from "../../database/database";

type Usuario = {
  id: number;
  correo: string;
  estado: string;
  rol: string | null;
};

export default function Administrador({ navigation }: any) {
  const [usuariosPendientes, setUsuariosPendientes] = useState<Usuario[]>([]);

  // Cargar usuarios pendientes
  const cargarUsuariosPendientes = async () => {
    try {
      const db = await inicializarBaseDatos();

      const usuarios = await db.getAllAsync<Usuario>(
        `SELECT id, correo, estado, rol
         FROM usuarios
         WHERE estado = ?
         ORDER BY id DESC`,
        "PENDIENTE",
      );

      setUsuariosPendientes(usuarios);
    } catch (error) {
      console.log("Error cargando usuarios:", error);

      Alert.alert("Error", "No se pudieron cargar los usuarios pendientes");
    }
  };

  // Activar usuario y asignar rol
  const activarUsuario = async (id: number, rol: "ADMIN" | "CLIENTE") => {
    try {
      const db = await inicializarBaseDatos();

      await db.runAsync(
        `UPDATE usuarios
         SET estado = ?, rol = ?
         WHERE id = ?`,
        "ACTIVO",
        rol,
        id,
      );

      Alert.alert(
        "Usuario activado",
        `La cuenta fue activada con el rol ${rol}`,
      );

      // Actualizar listado
      cargarUsuariosPendientes();
    } catch (error) {
      console.log("Error activando usuario:", error);

      Alert.alert("Error", "No se pudo activar el usuario");
    }
  };

  // Confirmar antes de activar
  const confirmarActivacion = (usuario: Usuario, rol: "ADMIN" | "CLIENTE") => {
    Alert.alert(
      "Confirmar activación",
      `¿Deseas activar a ${usuario.correo} como ${rol}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Activar",
          onPress: () => activarUsuario(usuario.id, rol),
        },
      ],
    );
  };

  useEffect(() => {
    cargarUsuariosPendientes();
  }, []);

  return (
    <View style={styles.container}>
      <Menu navigation={navigation} tipo="ADMIN" />
      <Text style={styles.titulo}>Panel de Administrador</Text>

      <TouchableOpacity
        style={styles.botonClientes}
        onPress={() => navigation.navigate("ClientesAdmin")}
      >
        <Text style={styles.textoBotonClientes}>Ver clientes registrados</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonClientes}
        onPress={() => navigation.navigate("ProductosAdmin")}
      >
        <Text style={styles.textoBotonClientes}>Gestionar productos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonClientes}
        onPress={() => navigation.navigate("ComprasAdmin")}
      >
        <Text style={styles.textoBotonClientes}>Ver compras realizadas</Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>Solicitudes pendientes</Text>

      {usuariosPendientes.length === 0 ? (
        <Text style={styles.sinUsuarios}>
          No hay usuarios pendientes de aprobación.
        </Text>
      ) : (
        <FlatList
          style={styles.lista}
          data={usuariosPendientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.correo}>{item.correo}</Text>

              <Text style={styles.estado}>Estado: {item.estado}</Text>

              <Text style={styles.textoRol}>Selecciona el rol:</Text>

              <View style={styles.contenedorBotones}>
                <TouchableOpacity
                  style={styles.boton}
                  onPress={() => confirmarActivacion(item, "CLIENTE")}
                >
                  <Text style={styles.textoBoton}>Cliente</Text>
                </TouchableOpacity>

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
