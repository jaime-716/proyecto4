import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";

type Props = {
  navigation: any;
  tipo: "ADMIN" | "CLIENTE";
  usuarioId?: number;
  correo?: string;
};

export default function Menu({
  navigation,
  tipo,
  usuarioId,
  correo,
}: Props) {
  const cerrarSesion = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.menu}>
      {tipo === "CLIENTE" && (
        <>
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("Home", {
                usuarioId,
                correo,
              })
            }
          >
            <Text style={styles.texto}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("Cliente", {
                usuarioId,
                correo,
                primerIngreso: false,
              })
            }
          >
            <Text style={styles.texto}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("Compra", {
                usuarioId,
                correo,
              })
            }
          >
            <Text style={styles.texto}>Comprar</Text>
          </TouchableOpacity>
        </>
      )}

      {tipo === "ADMIN" && (
        <>
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("Administrador")
            }
          >
            <Text style={styles.texto}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("ClientesAdmin")
            }
          >
            <Text style={styles.texto}>Clientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("ProductosAdmin")
            }
          >
            <Text style={styles.texto}>Productos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("ComprasAdmin")
            }
          >
            <Text style={styles.texto}>Compras</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.botonSalir}
        onPress={cerrarSesion}
      >
        <Text style={styles.textoSalir}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 15,
  },

  boton: {
    backgroundColor: "white",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 8,
  },

  texto: {
    color: "black",
    fontWeight: "bold",
    fontSize: 13,
  },

  botonSalir: {
    backgroundColor: "#424242",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 8,
  },

  textoSalir: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});