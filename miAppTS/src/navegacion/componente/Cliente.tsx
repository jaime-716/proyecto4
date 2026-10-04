import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

// Menú reutilizable para el usuario cliente.
import Menu from "./Menu";

// Menú reutilizable para el usuario cliente.
import { inicializarBaseDatos } from "../../database/database";

// Pantalla encargada de administrar el perfil del cliente.
//
// Funciones principales:
// - Crear perfil en el primer ingreso.
// - Consultar información existente.
// - Actualizar datos personales.
// - Mostrar menú del cliente cuando ya está registrado.
export default function Cliente({ route, navigation }: any) {
  const { usuarioId, correo, primerIngreso } = route.params;

// Estados utilizados para controlar los datos personales.
// clienteId permite saber si:
// - Existe un perfil y se debe actualizar.
// - No existe perfil y se debe crear.
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correoCliente, setCorreoCliente] = useState(correo);
  const [clienteId, setClienteId] = useState<number | null>(null);

  // Consulta la información del cliente almacenada
// en la base de datos utilizando el usuario autenticado.
  const cargarCliente = async () => {
    try {
      const db = await inicializarBaseDatos();

      // Busca el perfil asociado al usuario actual.
      const cliente: any = await db.getFirstAsync(
        "SELECT * FROM Cliente WHERE idUsuario = ?",
        usuarioId,
      );

      // Si existe información del cliente,
// carga los datos en los campos del formulario.
      if (cliente) {
        setClienteId(cliente.id);
        setNombre(cliente.nombre);
        setApellido(cliente.apellido);
        setCorreoCliente(cliente.correo);
      }
    } catch (error) {
      console.log("Error cargando cliente:", error);
    }
  };

  // Ejecuta la consulta automáticamente
// cuando la pantalla Cliente es abierta.
  useEffect(() => {
    cargarCliente();
  }, []);

// Guarda la información del cliente.
// Si existe un registro:
// actualiza los datos.
// Si no existe:
// crea un nuevo perfil.
  const guardarCliente = async () => {

    // Elimina espacios innecesarios
// y normaliza el correo a minúsculas.
    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();
    const correoLimpio = correoCliente.trim().toLowerCase();

    // Verifica que todos los campos requeridos
// tengan información antes de guardar.
    if (nombreLimpio === "" || apellidoLimpio === "" || correoLimpio === "") {
      Alert.alert("Error", "Debes completar todos los campos");
      return;
    }

    // Expresión utilizada para validar
// que el correo tenga una estructura correcta.
    const validarCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validarCorreo.test(correoLimpio)) {
      Alert.alert("Error", "Ingresa un correo electrónico válido");
      return;
    }

    try {
      // Inicializa la conexión SQLite
// para realizar operaciones de almacenamiento.
      const db = await inicializarBaseDatos();

      // Si el cliente ya tiene información registrada,
// se actualizan sus datos personales.
      if (clienteId) {
        
        await db.runAsync(
          // Modifica nombre, apellido y correo
// del registro seleccionado.
          `UPDATE Cliente
     SET nombre = ?, apellido = ?, correo = ?
     WHERE id = ?`,
          nombreLimpio,
          apellidoLimpio,
          correoLimpio,
          clienteId,
        );

        Alert.alert("Éxito", "Datos actualizados correctamente", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);

        // Si el cliente todavía no tiene perfil,
// crea un nuevo registro en la tabla Cliente.
      } else {
        
        // Guarda la fecha y hora de creación del perfil.
        const fechaActual = new Date().toISOString();

        await db.runAsync(

          // Relaciona el perfil del cliente
// con el usuario autenticado.
          `INSERT INTO Cliente
          (idUsuario, nombre, apellido, correo, fecha)
          VALUES (?, ?, ?, ?, ?)`,
          usuarioId,
          nombreLimpio,
          apellidoLimpio,
          correoLimpio,
          fechaActual,
        );

        Alert.alert(
          "Perfil creado",
          "Tus datos personales fueron registrados correctamente",
        );

        await cargarCliente();
      }

      // Después de completar el perfil por primera vez,
// envía al cliente al menú principal.
      if (primerIngreso) {
        navigation.replace("Home", {
          usuarioId,
          correo: correoLimpio,
        });
      }
    } catch (error: any) {
      console.log("ERROR CLIENTE:", error);

      Alert.alert(
        "Error",
        error?.message || "No se pudieron guardar los datos",
      );
    }
  };

  return (
    <View style={styles.container}>

{/*Muestra el menú únicamente cuando
el usuario ya completó su perfil.

Durante el primer registro se oculta
para obligar a completar los datos. */}
      {!primerIngreso && (
        <Menu
          navigation={navigation}
          tipo="CLIENTE"
          usuarioId={usuarioId}
          correo={correoCliente}
        />
      )}

      <Text style={styles.titulo}>

{/*Cambia el título dependiendo del estado:

Sin registro:
Completar Perfil.

Con registro:
Mi Perfil. */}
        {clienteId ? "Mi Perfil" : "Completar Perfil"}
      </Text>

      {!clienteId && (
        <Text style={styles.mensaje}>
          Antes de continuar debes completar tus datos personales.
        </Text>
      )}

{/* Permiten ingresar y modificar la información personal del cliente.*/}
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />

{/*El correo no puede modificarse porque pertenece al usuario registrado. */}
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correoCliente}
        editable={false}
      />
{/*Ejecuta la función encargada
de crear o actualizar el perfil. */}
      <TouchableOpacity style={styles.boton} onPress={guardarCliente}>
        <Text style={styles.textoBoton}>
          {clienteId ? "Actualizar" : "Guardar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#121212",
    padding: 25,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 15,
  },

  mensaje: {
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  boton: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  textoBoton: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});
