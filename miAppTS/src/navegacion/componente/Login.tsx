import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { inicializarBaseDatos } from "../../database/database";
import Ionicons from "@expo/vector-icons/Ionicons";

// Componente encargado de gestionar
// el inicio de sesión de los usuarios.
//
// Recibe navigation para poder cambiar
// entre las diferentes pantallas de la aplicación.
export default function Login({ navigation }: any) {

// Guarda el correo ingresado por el usuario.
//
// Inicialmente está vacío y cambia
// cada vez que el usuario escribe.
  const [correo, setCorreo] = useState("");

// Guarda la contraseña ingresada.
//
// Este valor será comparado posteriormente
// con la contraseña almacenada en SQLite.
  const [password, setPassword] = useState("");

// Controla si la contraseña se muestra
// o se oculta en pantalla.
//
// false:
// La contraseña aparece oculta.
//
// true:
// La contraseña se puede visualizar.
  const [mostrarPassword, setMostrarPassword] = useState(false);

// Función principal del inicio de sesión.
//
// Se encarga de:
// - validar campos.
// - consultar usuario.
// - verificar contraseña.
// - validar estado.
// - identificar rol.
// - redireccionar al usuario.
  const iniciarSesion = async () => {

// Función principal del inicio de sesión.
//
// Se encarga de:
// - validar campos.
// - consultar usuario.
// - verificar contraseña.
// - validar estado.
// - identificar rol.
// - redireccionar al usuario.
    const correoLimpio = correo.trim().toLowerCase();

// Verifica que el usuario haya ingresado
// correo y contraseña.
//
// Si algún campo está vacío,
// detiene el proceso.
    if (correoLimpio === "" || password === "") {
      Alert.alert("Error", "Debes llenar todos los campos");
      return;
    }

    try {
      const db = await inicializarBaseDatos();

// Realiza una consulta SQL.
//
// Busca el primer usuario encontrado
// cuyo correo coincida con el ingresado.
      const usuario: any = await db.getFirstAsync(
        "SELECT * FROM usuarios WHERE correo = ?",
        correoLimpio,
      );

// Muestra en consola la información encontrada.
//
// Es útil durante el desarrollo
// para verificar que SQLite devuelve
// los datos esperados.
      console.log("USUARIO ENCONTRADO:", usuario);

// Si la consulta no encuentra registros,
// significa que el correo no existe
// dentro de la base de datos.
      if (!usuario) {
        Alert.alert("Error", "No existe un usuario registrado con este correo");
        return;
      }

// Compara la contraseña ingresada
// con la almacenada en SQLite.
//
// Si son diferentes,
// bloquea el acceso.
      if (usuario.password !== password) {
        Alert.alert("Error", "La contraseña es incorrecta");
        return;
      }

      console.log("ESTADO:", usuario.estado);
      console.log("ROL:", usuario.rol);

// Verifica si la cuenta todavía
// no ha sido aprobada por un administrador.
      if (usuario.estado === "PENDIENTE") {

// Informa al usuario que debe esperar
// la activación de su cuenta.
        Alert.alert(
          "Cuenta pendiente",
          "Tu cuenta está pendiente de aprobación por un administrador.",
        );
        return;
      }

// Verifica si la cuenta fue deshabilitada.
      if (usuario.estado === "INACTIVO") {
        Alert.alert("Cuenta inactiva", "Tu cuenta se encuentra inactiva.");
        return;
      }

// Garantiza que solamente usuarios
// con estado ACTIVO puedan ingresar.
      if (usuario.estado !== "ACTIVO") {
        Alert.alert("Acceso denegado", "El estado de la cuenta no es válido.");
        return;
      }

// Garantiza que solamente usuarios
// con estado ACTIVO puedan ingresar.
      setCorreo("");
      setPassword("");

// Verifica si el usuario tiene
// permisos administrativos.
      if (usuario.rol === "ADMIN") {
        Alert.alert("Bienvenido", "Ingreso como administrador");

// Envía al usuario al panel
// de administración.
        navigation.navigate("Administrador");
        return;
      }

// Verifica si el usuario corresponde
// al rol cliente.
      if (usuario.rol === "CLIENTE") {
        
// Consulta si el usuario ya tiene
// sus datos personales registrados.
//
// Relación:
//
// usuarios.id
//      ↓
// Cliente.idUsuario
        const cliente: any = await db.getFirstAsync(
          "SELECT * FROM Cliente WHERE idUsuario = ?",
          usuario.id,
        );

// Si no existe información en Cliente,
// significa que es el primer ingreso
// y debe completar sus datos.
        if (!cliente) {
          Alert.alert(
            "Completa tu perfil",
            "Antes de continuar debes registrar tus datos personales.",
          );
          console.log("CLIENTE ENCONTRADO:", cliente);

// Envía al usuario a la pantalla
// de creación de perfil.
//
// primerIngreso permite saber
// que debe completar sus datos.
          navigation.navigate("Cliente", {
            usuarioId: usuario.id,
            correo: usuario.correo,
            primerIngreso: true,
          });

          return;
        }

        // Si ya tiene perfil
        Alert.alert("Bienvenido", `Hola ${cliente.nombre}`);

// Si el cliente ya tiene información,
// ingresa directamente a la pantalla principal.
        navigation.navigate("Home", {
          usuarioId: usuario.id,
          correo: usuario.correo,
        });

        return;
      }

// Controla un caso donde la cuenta
// está activa pero no tiene permisos definidos.
      Alert.alert(
        "Sin rol asignado",
        "La cuenta está activa pero no tiene un rol asignado.",
      );

// Captura errores durante:
//
// - conexión SQLite.
// - consulta SQL.
// - problemas de navegación.
//
// Muestra información útil para detectar
// el problema
    } catch (error: any) {
      console.log("ERROR LOGIN:", error);

      Alert.alert("Error", error?.message || String(error));
    }
  };

// Construye la pantalla donde
// el usuario ingresa sus credenciales.
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Iniciar sesion</Text>
      <View style={styles.cuadro}>

{/*Campo donde el usuario escribe
su correo electrónico.
Cada cambio actualiza
el estado correo.*/}
        <TextInput
          style={styles.input}
          placeholder="Correo"
          keyboardType="email-address"
          value={correo}
          autoCapitalize="none"
          onChangeText={setCorreo}
        />
        <View style={styles.contenedorPassword}>

{/*Campo protegido para contraseña.
secureTextEntry oculta los caracteres
cuando mostrarPassword es false.*/}
          <TextInput
            style={styles.inputPassword}
            placeholder="Contraseña"
            secureTextEntry={!mostrarPassword}
            value={password}
            onChangeText={setPassword}
          />

{/*Cambia entre mostrar y ocultar
la contraseña.
 Si está visible la oculta.
 Si está oculta la muestra.*/}
          <TouchableOpacity
            onPress={() => setMostrarPassword(!mostrarPassword)}
            style={styles.botonOjo}
          >

 {/* Cambia el icono según el estado 
 de visualización de la contraseña.*/}
            <Ionicons
              name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contenedorBotones}>

{/* Ejecuta toda la lógica
de autenticación.*/}
          <TouchableOpacity style={styles.boton} onPress={iniciarSesion}>
            <Text style={styles.textoBoton}>INGRESAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonRegistro}

// Envía al usuario a la pantalla
// donde puede crear una nueva cuenta.
            onPress={() => navigation.navigate("Registro")}
          >
            <Text style={styles.registro}>REGÍSTRATE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
  },

  cuadro: {
    width: 350,
    padding: 25,
    backgroundColor: "#070707",
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },

  input: {
    width: 300,
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  boton: {
    width: 140,
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textoBoton: {
    color: "black",
  },

  botonRegistro: {
    width: 140,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
  },

  registro: {
    color: "black",
    fontSize: 14,
  },

  contenedorPassword: {
    width: 300,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 10,
    marginBottom: 15,
  },

  inputPassword: {
    flex: 1,
    height: 46,
    paddingHorizontal: 15,
  },

  verPassword: {
    marginRight: 12,
    color: "blue",
    fontWeight: "bold",
  },

  contenedorBotones: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  botonOjo: {
    padding: 10,
  },
});
