import React, { useState, useEffect, FC } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    StatusBar,
    FlatList,
    Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../services/api";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";

interface User {
    id: number;
    name: string;
    profile: string;
    status: boolean;
}

interface ActionMenuProps {
    visible: boolean;
    userId: number;
    userStatus: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    onView: (userId: number) => void;
    onToggleStatus: (userId: number) => void;
    onDelete: (userId: number) => void;
}

const ActionMenu: FC<ActionMenuProps> = ({
    visible,
    userId,
    userStatus,
    position,
    onClose,
    onView,
    onToggleStatus,
    onDelete,
}) => {
    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View
                    style={[
                        styles.actionMenuModal,
                        {
                            top: position.y,
                            right: 20,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            onView(userId);
                            onClose();
                        }}
                    >
                        <Text style={styles.actionButtonText}>Visualizar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            onToggleStatus(userId);
                            onClose();
                        }}
                    >
                        <Text style={styles.actionButtonText}>
                            {userStatus ? "Desativar" : "Ativar"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            onDelete(userId);
                            onClose();
                        }}
                    >
                        <Text style={styles.deleteButtonText}>Deletar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const UserListScreen: FC = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>("all");
    const [menuVisible, setMenuVisible] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });

    const [headerUserName, setHeaderUserName] = useState("");
    const [headerIconName, setHeaderIconName] = useState<string | null>(null);

    useEffect(() => {
        const loadUserDataForHeader = async () => {
            const name = await AsyncStorage.getItem("userName");
            const email = await AsyncStorage.getItem("userEmail");
            const profile = await AsyncStorage.getItem("userProfile");

            setHeaderUserName(name || email || "Usuário");

            if (profile?.toUpperCase() === "ADMIN") {
                setHeaderIconName("shield-account");
            } else if (profile?.toUpperCase() === "BRANCH") {
                setHeaderIconName("store");
            } else if (profile?.toUpperCase() === "DRIVER") {
                setHeaderIconName("truck");
            } else {
                setHeaderIconName("account-circle");
            }
        };

        loadUserDataForHeader();
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [filter, users]);

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove([
                "@token",
                "userId",
                "userProfile",
                "userEmail",
                "userName",
            ]);
            navigation.reset({
                index: 0,
                routes: [{ name: "Login" as never }],
            });
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            Alert.alert(
                "Erro",
                "Não foi possível fazer logout. Tente novamente."
            );
        }
    };

    const fetchUsers = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await api.get("/user");
            setUsers(response.data);
        } catch (error: any) {
            console.error("Erro ao buscar usuários:", error);
            const errorMessage = extractApiErrorMessage(error);
            Alert.alert("Erro", errorMessage);
            if (error.response?.status === 401) {
                await handleLogout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const filterUsers = (): void => {
        if (filter === "all") {
            setFilteredUsers(users);
        } else if (filter === "DRIVER") {
            setFilteredUsers(
                users.filter((user) => user.profile?.toUpperCase() === "DRIVER")
            );
        } else if (filter === "BRANCH") {
            setFilteredUsers(
                users.filter((user) => user.profile?.toUpperCase() === "BRANCH")
            );
        }
    };

    const toggleUserStatus = async (userId: number): Promise<void> => {
        try {
            await api.patch(`/user/${userId}/status`);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId
                        ? { ...user, status: !user.status }
                        : user
                )
            );
            const updatedUser = users.find((u) => u.id === userId);
            const newStatus = updatedUser ? !updatedUser.status : false;
            Alert.alert(
                "Sucesso",
                `Usuário ${newStatus ? "ativado" : "desativado"} com sucesso.`
            );
        } catch (error: any) {
            console.error("Erro ao atualizar status:", error);
            const errorMessage = extractApiErrorMessage(error);
            Alert.alert("Erro", errorMessage);
            if (error.response?.status === 401) {
                await handleLogout();
            }
        }
    };

    const deleteUser = (userId: number): void => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir este usuário?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/user/${userId}`);
                            setUsers((prevUsers) =>
                                prevUsers.filter((user) => user.id !== userId)
                            );
                            Alert.alert(
                                "Sucesso",
                                "Usuário excluído com sucesso."
                            );
                        } catch (error: any) {
                            console.error("Erro ao excluir usuário:", error);
                            const errorMessage = extractApiErrorMessage(error);
                            Alert.alert("Erro", errorMessage);
                            if (error.response?.status === 401) {
                                await handleLogout();
                            }
                        }
                    },
                },
            ]
        );
    };

    const handleViewUser = (userId: number) => {
        navigation.navigate(
            "UserViewScreen" as never,
            { userId: userId.toString() } as never
        );
    };

    const handleNavigateToRegister = () => {
        navigation.navigate("UserRegistrationScreen" as never);
    };

    const openMenu = (event: any, userId: number) => {
        const { pageX, pageY } = event.nativeEvent;
        const adjustedY =
            pageY -
            (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0);
        setMenuPosition({ x: pageX, y: adjustedY });
        setMenuVisible(userId);
    };

    const closeMenu = () => {
        setMenuVisible(null);
    };

    const userProfile = ({ user }: { user: User }) => {
      switch (user.profile?.toUpperCase()){
        case "DRIVER":
          return "Motorista";
        case "BRANCH":
          return "Filial";
        default:
          return "Administrador";
      }
    }

    const renderUserItem = ({ item }: { item: User }) => (
        <View style={styles.userItemContainer}>
            <View style={styles.userInfoContainer}>
                <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons
                        name={
                            item.profile?.toUpperCase() === "DRIVER"
                                ? "truck-fast-outline"
                                : item.profile?.toUpperCase() === "BRANCH"
                                ? "store-plus"
                                : "shield-account"
                        }
                        size={24}
                        color="#4A70A8"
                    />
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userProfile}>{userProfile({ user: item })}</Text>
                </View>
            </View>
            <View style={styles.userActionsContainer}>
                <View
                    style={[
                        styles.statusIndicator,
                        {
                            backgroundColor: item.status
                                ? "#4CAF50"
                                : "#F44336",
                        },
                    ]}
                />
                <TouchableOpacity
                    onPress={(event) => openMenu(event, item.id)}
                    style={styles.menuButton}
                >
                    <MaterialCommunityIcons
                        name="dots-vertical"
                        size={24}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.screenContainer}>
            <StatusBar backgroundColor="#4A70A8" barStyle="light-content" />

            <View style={styles.header}>
                <View style={styles.headerLeftContent}>
                    {headerIconName && (
                        <MaterialCommunityIcons
                            name={headerIconName}
                            size={44}
                            color="#FFFFFF"
                            style={styles.headerIcon}
                        />
                    )}
                    <Text style={styles.headerTextStyle}>
                        Olá, {headerUserName}!
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.headerRightIcon}
                >
                    <MaterialCommunityIcons
                        name="logout"
                        size={28}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === "all" && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilter("all")}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === "all" && styles.filterButtonTextActive,
                        ]}
                    >
                        Todos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === "DRIVER" && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilter("DRIVER")}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === "DRIVER" &&
                                styles.filterButtonTextActive,
                        ]}
                    >
                        Motoristas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === "BRANCH" && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilter("BRANCH")}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === "BRANCH" &&
                                styles.filterButtonTextActive,
                        ]}
                    >
                        Filial
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4A70A8" />
                    <Text style={styles.loadingText}>
                        Carregando usuários...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyListText}>
                                Nenhum usuário encontrado.
                            </Text>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={handleNavigateToRegister}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ActionMenu
                visible={menuVisible !== null}
                userId={menuVisible || 0}
                userStatus={
                    users.find((u) => u.id === menuVisible)?.status || false
                }
                position={menuPosition}
                onClose={closeMenu}
                onView={handleViewUser}
                onToggleStatus={toggleUserStatus}
                onDelete={deleteUser}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: "#F0F2F5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 15,
        paddingVertical: 17,
        paddingHorizontal: 20,
        backgroundColor: "#4A70A8",
        width: "100%",
        minHeight: 90,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        paddingTop:
            Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + 17
                : 17,
    },
    headerLeftContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    headerIcon: {},
    headerTextStyle: {
        fontSize: 18,
        fontWeight: "500",
        color: "#ffffff",
    },
    headerRightIcon: {
        padding: 5,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 10,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#4A70A8",
    },
    filterButtonActive: {
        backgroundColor: "#4A70A8",
    },
    filterButtonText: {
        color: "#4A70A8",
        fontWeight: "bold",
    },
    filterButtonTextActive: {
        color: "#FFFFFF",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#666",
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 80,
    },
    userItemContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 15,
        marginVertical: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E8EAF6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    userProfile: {
        fontSize: 14,
        color: "#666",
    },
    userActionsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 15,
    },
    menuButton: {
        padding: 5,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    emptyListText: {
        fontSize: 16,
        color: "#666",
    },
    modalOverlay: {
        flex: 1,
    },
    actionMenuModal: {
        position: "absolute",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingVertical: 5,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minWidth: 120,
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    actionButtonText: {
        fontSize: 16,
        color: "#333",
    },
    deleteButtonText: {
        fontSize: 16,
        color: "#D35D5D",
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#D35D5D",
        borderRadius: 28,
        width: 56,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

export default UserListScreen;
