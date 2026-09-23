import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./componente/Home";
import Login from "./componente/Login";
import Registro from "./componente/Registro";
import Administrador from "./componente/Administrador";
import ClientesAdmin from "./componente/ClientesAdmin";
import Cliente from "./componente/Cliente";
import ProductosAdmin from "./componente/ProductosAdmin";
import Compra from "./componente/Compra";
import ComprasAdmin from "./componente/ComprasAdmin";
import DetallesAdmin from "./componente/DetallesAdmin";

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
        <Stack.Screen name="Cliente" component={Cliente} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen
          name="ClientesAdmin"
          component={ClientesAdmin}
          options={{ title: "CLIENTES" }}
        />
        <Stack.Screen
          name="ProductosAdmin"
          component={ProductosAdmin}
          options={{ title: "PRODUCTOS" }}
        />
        <Stack.Screen name="Administrador" component={Administrador} />
        <Stack.Screen name="Compra" component={Compra} />
        <Stack.Screen
          name="ComprasAdmin"
          component={ComprasAdmin}
          options={{ title: "COMPRAS" }}
        />

        <Stack.Screen
          name="DetallesAdmin"
          component={DetallesAdmin}
          options={{ title: "DETALLES" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
