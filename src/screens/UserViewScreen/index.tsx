import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";

interface Address {
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  state: string;
  city: string;
  complement: string;
}

interface UserDetails {
  id: number;
  name: string;
  status: boolean;
  full_address: Address;
  profile: string;
  email?: string;
}

const formatAddress = (address: Address): string => {
  if (!address) return "Endereço não disponível";
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.number) parts.push(address.number);
  if (address.neighborhood) parts.push(address.neighborhood);
  if (address.city && address.state)
    parts.push(`${address.city} - ${address.state}`);
  else if (address.city) parts.push(address.city);
  else if (address.state) parts.push(address.state);
  if (address.zip_code) parts.push(`CEP: ${address.zip_code}`);
  if (address.complement) parts.push(address.complement);
  return parts.length > 0 ? parts.join(", ") : "Endereço não disponível";
};

const getProfileLabel = (profile: string): string => {
  switch (profile?.toUpperCase()) {
    case "DRIVER":
      return "Motorista";
    case "BRANCH":
      return "Filial";
    case "ADMIN":
      return "Administrador";
    default:
      return profile || "N/A";
  }
};

const UserViewScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as { userId: string }) || { userId: "" };

  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>("");
  const [headerUserName, setHeaderUserName] = useState("");

  useEffect(() => {
    const loadUserDataForHeader = async () => {
      const name = await AsyncStorage.getItem("userName");
      const email = await AsyncStorage.getItem("userEmail");
      setHeaderUserName(name || email || "Usuário");
    };

    loadUserDataForHeader();
    fetchUserDetails();
  }, [params.userId]);

  useEffect(() => {
    if (user && user.full_address) {
      setFormattedAddress(formatAddress(user.full_address));
    }
  }, [user]);

  const fetchUserDetails = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/user/${params.userId}`);
      setUser(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar detalhes do usuário:", error);
      const errorMessage = extractApiErrorMessage(error);
      setError(errorMessage);
      Alert.alert("Erro", errorMessage, [
        { text: "Voltar", onPress: () => navigation.goBack() },
      ]);
      if (error.response?.status === 401) {
        await handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "@token",
        "userId",
        "userProfile",
        "userEmail",
        "userName",
      ]);
      navigation.reset({ index: 0, routes: [{ name: "Login" as never }] });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    fetchUserDetails();
  };

  if (isLoading) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color="#4A70A8" />
        <Text style={styles.loadingText}>
          Carregando detalhes do usuário...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>      
      <StatusBar backgroundColor="#4A70A8" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.headerBackButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTextStyle}>Olá, {headerUserName}!</Text>
        <View style={styles.headerSpacer}></View>
      </View>
      <View style={styles.contentContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={50}
              color="#D35D5D"
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : user ? (
          <>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons
                  name={
                    user.profile?.toUpperCase() === "DRIVER"
                      ? "truck-fast-outline"
                      : user.profile?.toUpperCase() === "BRANCH"
                      ? "store-plus"
                      : "shield-account"
                  }
                  size={60} 
                  color="#4A70A8"
                />
              </View>
              <Text style={styles.profileType}>
                {getProfileLabel(user.profile)}
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color="#4A70A8"
                  />
                </View>
                <Text style={styles.detailLabel}>Nome</Text>
                <Text style={styles.detailValue}>{user.name || "N/A"}</Text>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="card-account-details"
                    size={20}
                    color="#4A70A8"
                  />
                </View>
                <Text style={styles.detailLabel}>Cadastro</Text>
                <Text style={styles.detailValue}>{user.id || "N/A"}</Text>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="email"
                    size={20}
                    color="#4A70A8"
                  />
                </View>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{user.email || "N/A"}</Text>
              </View>

              <View style={[styles.detailItem, { borderBottomWidth: 0 }]}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color="#4A70A8"
                  />
                </View>
                <Text style={styles.detailLabel}>Endereço</Text>
                <Text
                  style={styles.detailValue}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {formattedAddress}
                </Text>
              </View>
            </View>

      
          </>
        ) : (
          <Text style={styles.placeholderText}>Nenhum dado disponível</Text>
        )}
      </View>
      {user && !error && (
        <View style={styles.footerContainer}>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons
              name={user.status ? "check-circle" : "close-circle"}
              size={20} 
              color={user.status ? "#4CAF50" : "#F44336"}
            />
            <Text style={styles.statusText}>
              Acesso {user.status ? "ativo" : "inativo"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    justifyContent: "space-between", 
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15, 
    paddingHorizontal: 15,
    backgroundColor: "#4A70A8",
    width: "100%",
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 15 : 15,
  },
  headerBackButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTextStyle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#ffffff",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 38,
  },
  contentContainer: {
    paddingHorizontal: 16, 
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 30, 
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#D35D5D",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4A70A8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholderText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 50,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 15, 
    backgroundColor: "#F0F2F5",
    marginTop: 10, 
  },
  avatarContainer: {
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: "#B0C4DE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10, 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  profileType: {
    fontSize: 20, 
    fontWeight: "bold",
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  detailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10, 
    marginBottom: 10, 
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10, 
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailIconContainer: {
    width: 35, 
    height: 35, 
    borderRadius: 17.5, 
    backgroundColor: "#E8EAF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10, 
   },
  detailLabel: {
    fontSize: 15, 
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    flex: 1,
  },
  detailValue: {
    fontSize: 15, 
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    flex: 2,
    textAlign: "right",
  },
  footerContainer: {
    backgroundColor: "#4A70A8",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 15,
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  statusText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
    marginLeft: 8,
  },
  extraButton: {
    backgroundColor: "#D35D5D",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  extraButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
});

export default UserViewScreen;
