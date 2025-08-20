import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardTypeOptions,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";

interface UserData {
  id: number;
  profile: string;
  token: string;
  name: string; 
}

const LoginScreen: FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);


  const determineProfileScreen = (profile: string): string => {
    const upperProfile = profile?.toUpperCase();
    if (upperProfile === "ADMIN") {
      return "UserListScreen";
    } else if (upperProfile === "BRANCH") {
      return "ListProducts"; 
    } else if (upperProfile === "DRIVER") {
      return "MovementList";
    } else {
      console.warn(`Perfil de usuário não reconhecido: ${profile}, redirecionando para UserListScreen`);
      return "UserListScreen";
    }
  };

  useEffect(() => {
    const checkLoginStatus = async (): Promise<void> => {
      try {
        const userToken = await AsyncStorage.getItem("@token");
        const userId = await AsyncStorage.getItem("userId");
        const userProfile = await AsyncStorage.getItem("userProfile");
        const userName = await AsyncStorage.getItem("userName");

        if (userToken && userId && userProfile) {
          const profileScreenName = determineProfileScreen(userProfile);

          navigation.reset({
            index: 0,
            routes: [
              {
                name: profileScreenName as never,
                params: {
                  userProfile,
                  userName: userName || `Usuário ${userId}`,
                },
              },
            ],
          });
        } else {
          setIsCheckingAuth(false);
        }
      } catch (e) {
        console.error("Falha ao buscar dados de login do AsyncStorage", e);
        setIsCheckingAuth(false);
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const validateEmail = (emailToValidate: string): boolean => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(emailToValidate);
  };

  const handleLogin = async (): Promise<void> => {
    if (!email.trim()) {
      Alert.alert(
        "Erro de Validação",
        "O campo de email não pode estar vazio."
      );
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Erro de Validação", "Por favor, insira um email válido.");
      return;
    }
    if (!password) {
      Alert.alert(
        "Erro de Validação",
        "O campo de senha não pode estar vazio."
      );
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        email: email,
        password: password,
      };

      const response = await api.post<UserData>("/login", requestBody);

      const userData = response.data;

   
      if (userData.id !== undefined && userData.token && userData.profile) {
        try {
          await AsyncStorage.setItem("userId", userData.id.toString());
          await AsyncStorage.setItem("@token", userData.token);
          await AsyncStorage.setItem("userProfile", userData.profile);
          await AsyncStorage.setItem("userName", userData.name);
          await AsyncStorage.setItem("userEmail", email);
          if (userData.name) {
            await AsyncStorage.setItem("userName", userData.name);
          }
          
          const profileScreenName = determineProfileScreen(userData.profile);
         
          navigation.reset({
            index: 0,
            routes: [
              {
                name: profileScreenName as never,
                params: {
                  userProfile: userData.profile,
                  userName: userData.name || `Usuário ${userData.id}`,
                },
              },
            ],
          });
        } catch (storageError) {
          console.error(
            "Erro ao armazenar dados no AsyncStorage:",
            storageError
          );
          Alert.alert(
            "Erro de Armazenamento",
            "Não foi possível salvar os dados do usuário localmente."
          );
        }
      } else {
        Alert.alert(
          "Erro nos Dados",
          "Resposta da API não contém todos os dados necessários (id, token, perfil)."
        );
      }
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(error);
      console.error("Erro na requisição de login:", error);
      Alert.alert("Erro no Login", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={[styles.fullScreenLoader]}>
        <ActivityIndicator size="large" color="#4A70A8" />
        <Text>Verificando autenticação...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar backgroundColor="#4A70A8" barStyle="light-content" />
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Olá!</Text>
          <Text style={styles.headerSubtitle}>Bem vindo a Umbrella</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.loginTitle}>Login</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#A0A0A0"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            keyboardType={"email-address" as KeyboardTypeOptions}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#A0A0A0"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Funcionalidade não implementada",
              "A recuperação de senha ainda não foi implementada."
            )
          }
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.socialLoginPrompt}>Entre com</Text>

        <View style={styles.socialLoginContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              Alert.alert(
                "Login Social",
                "Login com Facebook não implementado."
              )
            }
          >
            <FontAwesome name="facebook" size={28} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              Alert.alert("Login Social", "Login com Google não implementado.")
            }
          >
            <FontAwesome name="google" size={28} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              Alert.alert("Login Social", "Login com Apple não implementado.")
            }
          >
            <FontAwesome name="apple" size={30} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Não tem uma conta? </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Funcionalidade não implementada",
                "A criação de conta ainda não foi implementada."
              )
            }
          >
            <Text style={styles.signUpLink}>Crie uma!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  headerContainer: {
    backgroundColor: "#4A70A8",
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight || 20 + 20 : 40,
    paddingHorizontal: 25,
    paddingBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 35,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 30,
    shadowColor: "#000",
    alignSelf: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3A4D6F",
    marginBottom: 25,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    height: "100%",
  },
  forgotPasswordText: {
    textAlign: "center",
    color: "#606060",
    fontSize: 14,
    marginBottom: 25,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  loginButton: {
    backgroundColor: "#D35D5D",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
    height: 55,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A0B4D0",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-bold",
  },
  socialLoginPrompt: {
    textAlign: "center",
    color: "#606060",
    fontSize: 14,
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  socialButton: {
    width: 85,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signUpText: {
    color: "#606060",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  signUpLink: {
    color: "#B04040",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-bold",
  },
});

export default LoginScreen;

