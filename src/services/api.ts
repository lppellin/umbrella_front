import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "./navigationService";
import { Alert } from "react-native";
import { navigate } from "./navigationService";


const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

const signOut = async () => {
  try {
    await AsyncStorage.multiRemove(["@token", "userId", "userProfile"]);

    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: "Login" as never }],
      });
    }
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
}, async (error) => {
    if (error.response?.status === 401 && error.response?.data?.error === "TOKEN_EXPIRED") {
        Alert.alert("Aviso", "Sessão expirada, faça login novamente");
        await AsyncStorage.removeItem("@token");
        navigate("Login")
        return 
    } else {
        return Promise.reject(error);
    }
});

export default api;
