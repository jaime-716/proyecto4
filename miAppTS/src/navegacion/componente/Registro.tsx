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

// Componente encargado del registro
// de nuevos usuarios.
//
// Este componente permite crear una cuenta,
// pero el usuario no puede ingresar inmediatamente.
//
// Primero debe ser aprobado por un administrador.
export default function Registro() {

// Guarda el correo ingresado por el usuario.
//
// Inicialmente empieza vacío.
// Cada vez que el usuario escribe,
// se actualiza mediante setCorreo.
  const [correo, setCorreo] = useState("");

// Guarda la contraseña ingresada.
//
// Este valor será validado antes
// de enviarlo a la base de datos.
  const [password, setPassword] = useState("");

// Función principal del registro.
//
// Se encarga de:
//
// - validar información ingresada.
// - conectar con SQLite.
// - verificar usuarios existentes.
// - crear una nueva cuenta.
  const registrarse = async () => {

// Elimina espacios al inicio y al final
// del correo.
//
// Además convierte todo a minúsculas.
//
// Esto evita crear usuarios duplicados
// por diferencias de escritura.
//
// Ejemplo:
//
// Usuario@Correo.com
//
// usuario@correo.com
//
// serán tratados igual.
    const correoLimpio = correo.trim().toLowerCase();

// Verifica que el usuario haya ingresado
// correo y contraseña.
//
// Si algún campo está vacío,
// detiene el proceso de registro.
    if (correo === "" || password === "") {
      Alert.alert("Error", "Debes llenar todos los campos");
      return;
    }

// Expresión regular utilizada
// para validar el formato del correo.
//
// Comprueba que tenga:
//
// - texto antes del @.
// - símbolo @.
// - dominio después del punto.
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Ejecuta la validación.
//
// Si el correo no cumple el formato,
// no permite continuar.
    if (!expresionCorreo.test(correoLimpio)) {
      Alert.alert("Error", "Ingresa un correo electrónico válido");
      return;
    }





// - mínimo 6 caracteres.
// - debe contener letras.
// - debe contener números.
    const expresionPassword = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

// Si la contraseña no cumple las reglas,
// se detiene el registro.
    if (!expresionPassword.test(password)) {
      Alert.alert(
        "Error",
        "La contraseña debe tener mínimo 6 caracteres e incluir letras y números",
      );
      return;
    }

    try {
      const db = await inicializarBaseDatos();

// Consulta si ya existe una cuenta
// registrada con el mismo correo.
//
// Esto evita usuarios duplicados.
      const usuarioExistente = await db.getFirstAsync(
        "SELECT id FROM usuarios WHERE correo = ?",
        correoLimpio,
      );

// Si encuentra un usuario,
// bloquea el registro.
//
// Un correo solamente puede tener
// una cuenta asociada.
      if (usuarioExistente) {
        Alert.alert("Error", "Ya existe una cuenta registrada con este correo");
        return;
      }

// Inserta un nuevo usuario
// dentro de la tabla usuarios.
//
// Guarda:
//
// correo:
// Usuario registrado.
//
// password:
// Contraseña ingresada.
//
// estado:
// Se crea como PENDIENTE.
//
// rol:
// Inicialmente queda vacío.
      await db.runAsync(
        `INSERT INTO usuarios
       (correo, password, estado, rol)
       VALUES (?, ?, ?, ?)`,
        correoLimpio,
        password,
        "PENDIENTE",
        null,
      );

// Informa al usuario que el registro
// fue correcto.
//
// También indica que debe esperar
// la aprobación administrativa.
      Alert.alert(
        "Registro exitoso",
        "Tu cuenta fue creada y se encuentra pendiente de aprobación por un administrador.",
      );

// Limpia los campos después
// de completar correctamente
// el registro.
      setCorreo("");
      setPassword("");

// Captura problemas durante:
//
// - conexión con SQLite.
// - inserción de datos.
// - restricciones de la tabla.
//
// Muestra información útil
// durante el desarrollo.
    } catch (error) {
      console.log("ERROR REAL:", error);

      Alert.alert("Error", "Ocurrió un error al registrar el usuario");
    }
  };

// Construye la pantalla
// donde el usuario ingresará
// sus datos de registro.
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro</Text>
      <View style={styles.cuadro}>

{/* Campo donde el usuario escribe 
su correo electrónico.
Cada cambio actualiza
el estado correo.*/}
        <TextInput
          style={styles.input}
          placeholder="Correo"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />

{/*Campo protegido para contraseña.
 secureTextEntry oculta
los caracteres escritos.*/}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

{/* Ejecuta la función registrarse()
cuando el usuario presiona
el botón.*/}
        <TouchableOpacity style={styles.boton} onPress={registrarse}>
          <Text style={styles.textoBoton}>REGISTRARSE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
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
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  boton: {
    width: 110,
    height: 50,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textoBoton: {
    color: "black",
    fontSize: 14,
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
  },
});
