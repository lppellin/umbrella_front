import { Image, StyleSheet, Text, View } from "react-native";
import colors from "../utils/colors";

export interface Movement {
    id: number;
    product: {
        name: string;
        url_cover: string;
        branch: {
            street: string;
            number: string;
            complement: string | null;
            neighborhood: string;
            city: string;
            state: string;
            user: {
                name: string;
            };
        };
    };
    quantity: number;
    branch: {
        street: string;
        number: string;
        complement: string | null;
        neighborhood: string;
        city: string;
        state: string;
        user: {
            name: string;
        };
    };
    status: "PENDING" | "IN_PROGRESS" | "FINISHED";
}

interface MovementCardProps {
    Movement: Movement;
}

export default function MovementCard({ Movement }: MovementCardProps) {

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Aguardando Coleta";
            case "IN_PROGRESS":
                return "Em Andamento";
            case "FINISHED":
                return "Finalizada";
            default:
                return status;
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.imageFrame}>
                    <Image
                        source={{ uri: Movement.product.url_cover }}
                        style={styles.productImage}
                    />
                </View>
                <View>
                    <Text>Movimentação #{Movement.id}</Text>
                    <Text style={styles.productName}>{Movement.product.name}</Text>
                </View>
            </View>

            <View style={styles.info}>
                <Text style={styles.label}>Origem: </Text>
            </View>
            <Text style={styles.address} numberOfLines={3} ellipsizeMode="tail">
                {Movement.product.branch.street}, {Movement.product.branch.number},{" "}
                {Movement.product.branch.complement || ""} -{" "}
                {Movement.product.branch.neighborhood}, {Movement.product.branch.city}{" "}
                - {Movement.product.branch.state}
            </Text>

            <View style={styles.info}>
                <Text style={styles.label}>Destino: </Text>
            </View>
            <Text style={styles.address} numberOfLines={3} ellipsizeMode="tail">
                {Movement.branch.street}, {Movement.branch.number},{" "}
                {Movement.branch.complement || ""} - {Movement.branch.neighborhood},{" "}
                {Movement.branch.city} - {Movement.branch.state}
            </Text>

            <View style={styles.info}>
                <Text style={styles.label}>Quantidade: </Text>
                <Text>{Movement.quantity}</Text>
            </View>

            <View style={styles.info}>
                <Text style={styles.label}>Status: </Text>
                <Text>{getStatusLabel(Movement.status)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.whiteBackground,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    imageFrame: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: colors.blueLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        backgroundColor: colors.whiteBackground,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    productName: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 4,
    },
    info: {
        flexDirection: "row",
        marginVertical: 4,
    },
    label: {
        fontWeight: "bold",
        marginRight: 4,
    },
    address: {
        marginLeft: 8,
        marginBottom: 4,
        flexShrink: 1,
        flexWrap: "wrap",
        width: "95%",
    },
});