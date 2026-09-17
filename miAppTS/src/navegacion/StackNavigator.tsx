import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./componente/Home";
import Texto from "./componente/Texto";
import Input from "./componente/Input";
import Boton from "./componente/Boton";
import Lista from "./componente/Lista";
import EjemploModal from "./componente/EjemploModal";
import Login from "./componente/Login";
import Registro from "./componente/Registro";
import Administrador from "./componente/Administrador";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: "INICIO" }}
        />
        <Stack.Screen name="Texto" component={Texto} />
        <Stack.Screen name="Input" component={Input} />
        <Stack.Screen name="Boton" component={Boton} />
        <Stack.Screen name="Lista" component={Lista} />
        <Stack.Screen name="Modal" component={EjemploModal} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen name="Administrador" component={Administrador}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
