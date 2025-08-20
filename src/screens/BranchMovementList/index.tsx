import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "react-native";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import DropDownPicker from 'react-native-dropdown-picker';
import MovementCard, { Movement } from "../../Components/MovementCard";
import colors from "../../utils/colors";
import Header from "../../Components/Header";
import api from "../../services/api";
import BranchMenu from "../../Components/BranchMenu";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BranchMovementList({ navigation }: { navigation: NavigationProp<any> }) {
    const insets = useSafeAreaInsets()
    const [movements, setMovements] = useState<Movement[]>([]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [items, setItems] = useState([
        { label: 'Todos', value: 'all' },
        { label: 'Aguardando Coleta', value: 'PENDING' },
        { label: 'Em Andamento', value: 'IN_PROGRESS' },
        { label: 'Finalizadas', value: 'FINISHED' },
    ]);

    const fetchMovements = useCallback(async (status: string | null) => {
        try {
            const response = await api.get(
                'movements/branches/me',
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            const sortedMovements = (response.data as Movement[])
                .sort((a, b) => a.id - b.id)
                .filter(movement =>
                    (status ?? "all") === "all" ? true : movement.status === status
                );
            setMovements(sortedMovements);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMovements(value);
        }, [fetchMovements, value])
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }}>
            <StatusBar barStyle="light-content" backgroundColor={colors.blueMain} translucent={false} />
            <Header />
            <BranchMenu
                selected="movements"
                onPressMovements={() => navigation.navigate('BranchMovementList')}
                onPressProducts={() => navigation.navigate('ListProducts')}
            />

            <FlatList
                data={movements}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <MovementCard Movement={item} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhum dado encontrado.</Text>
                }
            />

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    dropDownDirection="TOP"
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    style={styles.picker}
                    listItemContainerStyle={styles.listItemContainer}
                    dropDownContainerStyle={styles.dropDownContainer}
                    placeholder="Filtrar por status"
                />

                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => navigation.navigate('NewBranchMovement')}
                >
                    <Text style={styles.buttonText}>Adicionar Movimentação</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    picker: {
        width: "90%",
        marginBottom: 10,
        alignSelf: "center",
        minHeight: 40,
        height: 40,
        borderColor: colors.greyLight,
    },
    dropDownContainer: {
        minHeight: 40,
        marginBlockEnd: 4,
        width: "90%",
        alignSelf: "center",
        borderColor: colors.greyLight,
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10,
    },
    listItemContainer: {
        height: 40,
    },
    btn: {
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: colors.red,
        borderRadius: 16,
        height: 50,
        width: "90%",
        marginBottom: 2,
        alignSelf: "auto",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    footer: {
        alignItems: 'center',
        padding: 8,
        backgroundColor: colors.whiteBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});