import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import colors from "../utils/colors";

type Props = {
    selected: "movements" | "products";
    onPressMovements: () => void;
    onPressProducts: () => void;
};

export default function BranchMenu({ selected, onPressMovements, onPressProducts }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[{ backgroundColor: selected === "movements" ? colors.blueLight : colors.screenBackground }, styles.button]}
                onPress={onPressMovements}
                activeOpacity={selected === "movements" ? 1 : 0.7}
            >
                <Text style={{
                    color: selected === "movements" ? colors.whiteBackground : colors.blueLight,
                    fontWeight: 'bold',
                    fontSize: 15
                }}>
                    Movimentações
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[{ backgroundColor: selected === "products" ? colors.blueLight : colors.screenBackground }, styles.button]}
                onPress={onPressProducts}
                activeOpacity={selected === "products" ? 1 : 0.7}
            >
                <Text style={{
                    color: selected === "products" ? colors.whiteBackground : colors.blueLight,
                    fontWeight: 'bold',
                    fontSize: 15
                }}>
                    Produtos
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = {
    container: {
        flexDirection: 'row' as const,
        width: '92%' as const,
        alignSelf: 'center' as const,
        marginBottom: 2,
        marginTop: -2,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: colors.screenBackground,
        borderWidth: 0,
        elevation: 4,
        overflow: 'hidden' as const,
        zIndex: 1,
    },
    button: {
        flex: 1,
        minWidth: 100,
        paddingVertical: 6,
        alignItems: 'center' as const,
    },
};