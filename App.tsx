import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    View,
    Text,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import Login from "./src/screens/Login";
import UserListScreen from "./src/screens/UserListScreen";
import UserViewScreen from "./src/screens/UserViewScreen/index"
import ListProducts from "./src/screens/Products";
import RegisterProducts from "./src/screens/Products/cadastroProdutos";
import NewBranchMovement from "./src/screens/BranchNewMovement";
import { CurrentMovement } from "./src/screens/Movements/CurrentMovement";
import { MovementsList } from "./src/screens/Movements/MovementsList";
import BranchMovementList from "./src/screens/BranchMovementList";
import UserRegistrationScreen from "./src/screens/UserRegistrationScreen";
import { navigationRef } from "./src/services/navigationService";
import colors from "./src/utils/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export type RootStackParamList = {
    Login: undefined;
    UserRegistrationScreen: undefined;
    BranchMovementList: undefined;
    NewBranchMovement: undefined;
    ListProducts: undefined;
    RegisterProducts: undefined;
    MovementList: undefined;
    CurrentMovement: undefined;
    UserListScreen: undefined;
    UserViewScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<string | null>(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const id = await AsyncStorage.getItem("userId");
                const profile = await AsyncStorage.getItem("userProfile");

                setUserToken(token);
                setUserId(id);
                setUserProfile(profile);
            } catch (error) {
                console.error("Erro ao verificar status de login:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, []);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#F0F2F5",
                }}
            >
                <ActivityIndicator size="large" color="#4A70A8" />
                <Text>Carregando...</Text>
            </View>
        );
    }

    SystemUI.setBackgroundColorAsync(colors.whiteBackground);

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <NavigationContainer ref={navigationRef}>
                        <Stack.Navigator
                            initialRouteName={
                                userToken ? "MovementList" : "Login"
                            }
                            screenOptions={{
                                headerStyle: { backgroundColor: "#4A70A8" },
                                headerTintColor: "#fff",
                                headerTitleStyle: { fontWeight: "bold" },
                            }}
                        >
                            <Stack.Screen
                                name="Login"
                                component={Login}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="UserRegistrationScreen"
                                component={UserRegistrationScreen}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="MovementList"
                                component={MovementsList}
                                options={{ title: "Movimentações Disponíveis" }}
                            />
                            <Stack.Screen
                                name="CurrentMovement"
                                component={CurrentMovement}
                                options={{ title: "Movimentação Atual" }}
                            />
                        </Stack.Navigator>
                        <StatusBar backgroundColor="#150230" />
                    </NavigationContainer>
                </GestureHandlerRootView>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <NavigationContainer ref={navigationRef}>
                        <Stack.Navigator initialRouteName="Login">
                            <Stack.Screen
                                name="Login"
                                component={Login}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="UserRegistrationScreen"
                                component={UserRegistrationScreen}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="UserListScreen"
                                component={UserListScreen}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="UserViewScreen"
                                component={UserViewScreen}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="MovementList"
                                component={MovementsList}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="CurrentMovement"
                                component={CurrentMovement}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="BranchMovementList"
                                component={BranchMovementList}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="NewBranchMovement"
                                component={NewBranchMovement}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="RegisterProducts"
                                component={RegisterProducts}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="ListProducts"
                                component={ListProducts}
                                options={{ headerShown: false }}
                            />
                        </Stack.Navigator>
                        <StatusBar backgroundColor="#150230" />
                    </NavigationContainer>
                </GestureHandlerRootView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

export default App;
