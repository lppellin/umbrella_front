import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    Platform,
    StatusBar,
    Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function Header() {
    const [userName, setUserName] = useState("");
    const [userProfile, setUserProfile] = useState("");
    const [icon, setIcon] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const loadUserData = async () => {
            const name = await AsyncStorage.getItem("userName");
            const profile = await AsyncStorage.getItem("userProfile");

            setUserName(name || "");
            setUserProfile(profile || "");

            if (profile === "ADMIN") {
                setIcon(require("../../assets/adm.png"));
            } else if (profile === "BRANCH") {
                setIcon(require("../../assets/branch.png"));
            } else {
                setIcon(require("../../assets/truck.png"));
            }
        };

        loadUserData();
    }, []);

    const getProfileIconName = () => {
        switch (userProfile?.toUpperCase()) {
            case "DRIVER":
                return "truck-fast-outline";
            case "BRANCH":
                return "store-plus";
            default:
                return "shield-account";
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

    return (
        <View style={styles.header}>
            <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
                <MaterialCommunityIcons
                    name={getProfileIconName()}
                    size={28}
                    color="#FFF"
                />
                <Text style={styles.textStyle}>Olá, {userName}!</Text>
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
    );
}

const styles = StyleSheet.create({
    icon: {
        width: 44,
        height: 44,
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
    textStyle: {
        fontSize: 18,
        fontWeight: "500",
        color: "#ffffff",
    },
    headerRightIcon: {
        padding: 5,
    },
});
