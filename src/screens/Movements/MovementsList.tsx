import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../styles/colors/colors";
import Header from "../../Components/Header";

interface Movement {
    id: string;
    product: { id: string; name: string; url_cover?: string };
    quantity: number;
    branch: { id: string; user: { name: string } };
}

export const MovementsList = () => {
    const [movements, setMovements] = useState<Movement[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        loadMovements();
    }, []);

    async function loadMovements() {
        try {
            const res = await api.get("/movements");
            console.log("Movimentações:", res.data);
            setMovements(res.data);
        } catch {
            console.log("erro");
            Alert.alert("Erro ao carregar movimentações");
        }
    }

    async function handleStart(id: string) {
        try {
            await api.patch(`/movements/${id}/start`);
            Alert.alert("Entrega iniciada!");
            navigation.navigate("CurrentMovement" as never);
        } catch (err: any) {
          console.log("Erro ao iniciar entrega:", err.response?.data);
            Alert.alert(
                "Erro",
                err.response?.data?.message || "Erro ao iniciar"
            );
        }
    }

    const renderItem = ({ item }: { item: Movement }) => (
        <View style={styles.card}>
            <View style={{ flexDirection: "row" }}>
                {item.product.url_cover && (
                    <Image
                        source={{ uri: item.product.url_cover }}
                        style={styles.image}
                    />
                )}
                <View>
                    <Text style={styles.title}>ID Movimentação: {item.id}</Text>
                    <Text style={styles.text}>{item.product.name}</Text>
                    <Text style={styles.text}>Quantidade: {item.quantity}</Text>
                    <Text style={styles.text}>
                        Destino: {item.branch.user.name}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => handleStart(item.id)}
            >
                <Text style={styles.buttonText}>Iniciar Entrega</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View>
            <Header />
            <FlatList
                data={movements}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.container}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: colors.background,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: "#fff",
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
    },
    image: { width: 150, height: 150, borderRadius: 8, marginBottom: 8 },
    title: {
        fontSize: 16,
        color: colors.title,
        fontWeight: "bold",
        marginBottom: 4,
    },
    text: { color: colors.detail, marginBottom: 2 },
    button: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 6,
        marginTop: 8,
    },
    buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
