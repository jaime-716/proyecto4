import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";

// Define las propiedades que recibe el componente Menu
// navigation: permite desplazarse entre pantallas
// tipo: determina si el usuario es ADMIN o CLIENTE
// usuarioId y correo: datos del usuario autenticado que se conservan durante la navegación
type Props = {
  navigation: any;
  tipo: "ADMIN" | "CLIENTE";
  usuarioId?: number;
  correo?: string;
};

// Componente principal del menú de navegación
export default function Menu({
  navigation,
  tipo,
  usuarioId,
  correo,
}: Props) {

 // Función encargada de cerrar la sesión del usuario
  // Utiliza reset para eliminar el historial de navegación
  // y regresar nuevamente a la pantalla de Login
  const cerrarSesion = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (

    // Contenedor principal del menú
    <View style={styles.menu}>

{/*Opciones disponibles para usuarios con rol CLIENTE
Estas opciones permiten acceder a las funcionalidades 
principales del cliente dentro de la aplicación*/}
      
      {tipo === "CLIENTE" && (
        <>

{/*Botón Inicio:
Permite regresar a la pantalla principal del cliente.
Se envían los datos del usuario para conservar la sesión.*/}
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


{/*Botón Perfil:
Permite acceder a la información personal del cliente.
Envía el usuario identificado y el correo registrado.*/}
          
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

  
{/*/Botón Comprar:
Permite ingresar al módulo donde el cliente
podrá realizar compras dentro del sistema.*/}
          
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

   
{/* Opciones disponibles para usuarios con rol ADMIN
Permiten gestionar la información general del sistema*/}
      
      {tipo === "ADMIN" && (
        <>
 
{/* Botón Inicio:
Dirige al panel principal del administrador.*/}
          
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("Administrador")
            }
          >
            <Text style={styles.texto}>Inicio</Text>
          </TouchableOpacity>


{/* Botón Clientes:
Permite acceder al módulo donde el administrador
puede consultar los clientes registrados.*/}
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("ClientesAdmin")
            }
          >
            <Text style={styles.texto}>Clientes</Text>
          </TouchableOpacity>


{/* Botón Productos:
Permite ingresar al módulo de administración de productos e inventario.*/}
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              navigation.navigate("ProductosAdmin")
            }
          >
            <Text style={styles.texto}>Productos</Text>
          </TouchableOpacity>

{/*Botón Compras:
Permite acceder al módulo administrativo
para consultar las compras realizadas.*/}
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

{/*Botón Salir:
Disponible para todos los usuarios.
Permite cerrar la sesión y volver al Login.*/}
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