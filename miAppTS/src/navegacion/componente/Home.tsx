import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Menu from "./Menu";

// Componente principal de la pantalla de inicio.
//
// Esta pantalla se muestra después de que el usuario
// inicia sesión correctamente.
//
// Recibe:
// navigation:
// Permite cambiar entre pantallas.
//
// route:
// Permite recibir información enviada
// desde otras pantallas.
export default function Home({ navigation, route }: any) {

// Obtiene el identificador del usuario
// enviado desde la pantalla Login.
//
// Este valor permite mantener relacionada
// la sesión actual con los datos almacenados
// en la base de datos.
  const usuarioId = route?.params?.usuarioId;

// Obtiene el correo del usuario autenticado.
//
// Se utiliza principalmente para mostrar
// información del usuario y mantener
// la navegación personalizada.
  const correo = route?.params?.correo;

// Construye la interfaz visual
// que verá el cliente al ingresar
// a la aplicación.
  return (

// View funciona como contenedor principal.
//
// Dentro de él se organizan:
// - menú.
// - contenido principal.
    <View style={styles.container}>

{/*Carga el menú general del cliente.
Envía información necesaria para
que el menú pueda navegar correctamente.*/}
      <Menu

// Permite que el componente Menu
// pueda cambiar entre pantallas.
//NAVIGATION=NAVIGATION
// Ejemplo:
// Perfil
// Comprar
// Cerrar sesión
        navigation={navigation}
        tipo="CLIENTE"
        usuarioId={usuarioId}
        correo={correo}
      />

{/*Agrupa el contenido central
de la pantalla.
Separa el menú de la información
principal.*/}
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Inicio</Text>

        <Text style={styles.subtitulo}>Bienvenido</Text>

{/*Explica al usuario las acciones
 principales disponibles dentro
de la aplicación.
indica que desde el menú puede:
 - consultar su información personal.
- realizar compras.*/}
        <Text style={styles.mensaje}>
          Desde el menú puedes consultar tu perfil y realizar tus compras.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },

  contenido: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  titulo: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitulo: {
    color: "#CCCCCC",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },

  mensaje: {
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
