import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, ScrollView, LogBox } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../utils/colors";
import api from "../../services/api";

LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews']);


const NewBranchMovement = () => {
    const insets = useSafeAreaInsets();

    type Branch = {
        id: string;
        user: {
            name: string;
        };
    };

    type Product = {
        id: string;
        name: string;
    };

    const [branchList, setBranchList] = useState<Branch[]>([]);
    const [productList, setProductList] = useState<Product[]>([]);

    const [loggedBranch, setLoggedBranch] = useState<string>("");
    const [destinationBranch, setDestinationBranch] = useState<string>("");
    const [product, setProduct] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [observations, setObservations] = useState<string>("");

    const [productStock, setProductStock] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loggedBranchName, setLoggedBranchName] = useState<string>("");

    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [branchDropdownItems, setBranchDropdownItems] = useState(
        branchList
            .filter(branch => branch.id !== loggedBranch)
            .map(branch => ({
                label: branch.user?.name || "Filial sem nome",
                value: branch.id
            }))
    );

    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const [productDropdownItems, setProductDropdownItems] = useState(
        productList.map(item => ({
            label: item.name || "Produto sem nome",
            value: item.id
        }))
    );

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/me');
            setProductList(response.data);
            const stock: Record<string, number> = {};
            response.data.forEach((item: any) => {
                stock[item.id] = item.amount;
            });
            setProductStock(stock);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get("/branches");
            setBranchList(response.data);
        } catch (error) {
            console.error("Erro ao buscar filiais:", error);
        }
    };

    const fetchProductQuantity = async (productId: string) => {
        try {
            const response = await api.get('/products');

            const foundProduct = response.data.find((item: any) => item.id === productId);

            const quantity = foundProduct ? (foundProduct.amount || 0) : 0;

            setProductStock(prev => ({
                ...prev,
                [productId]: quantity
            }));

            return quantity;
        } catch (error) {
            console.error("Erro ao buscar quantidade do produto:", error);
            return 0;
        }
    };

    const fetchLoggedBranch = async () => {
        try {
            const response = await api.get('/branches/me');
            setLoggedBranch(response.data.id);
            setLoggedBranchName(response.data.user?.name || "Filial sem nome");
        } catch (error) {
            console.error("Erro ao buscar filial logada:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchBranches();
        fetchLoggedBranch();
    }, []);

    useEffect(() => {
        if (loggedBranch && product) {
            fetchProductQuantity(product);
        }
    }, [loggedBranch, product]);

    useEffect(() => {
        if (product) {
            fetchProductQuantity(product);
        }
    }, [product]);

    useEffect(() => {
        setBranchDropdownItems(
            branchList
                .filter(branch => branch.id !== loggedBranch)
                .map(branch => ({
                    label: branch.user?.name || "Filial sem nome",
                    value: branch.id
                }))
        );
    }, [branchList, loggedBranch]);

    useEffect(() => {
        setProductDropdownItems(
            productList.map(item => ({
                label: item.name || "Produto sem nome",
                value: item.id
            }))
        );
    }, [productList]);


    const handleSubmit = async () => {
        if (!loggedBranch || !destinationBranch || !product || !quantity) {
            Alert.alert("Erro", "Todos os campos são obrigatórios.");
            return;
        }

        if (loggedBranch === destinationBranch) {
            Alert.alert("Erro", "As filiais de origem e destino devem ser diferentes.");
            return;
        }

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            const availableQuantity = await fetchProductQuantity(product);
            const quantityToMove = Number(quantity);

            if (quantityToMove <= 0) {
                Alert.alert("Erro", "A quantidade deve ser maior que zero.");
                setIsLoading(false);
                return;
            }

            if (quantityToMove > availableQuantity) {
                Alert.alert(
                    "Erro",
                    `Quantidade insuficiente. Disponível: ${availableQuantity}, Solicitado: ${quantityToMove}.`
                );
                setIsLoading(false);
                return;
            }

            const requestPayload = {
                origin_branch_id: parseInt(loggedBranch),
                destination_branch_id: parseInt(destinationBranch),
                product_id: parseInt(product),
                quantity: quantityToMove,
                observations: observations
            };


            const response = await api.post('/movements', requestPayload);


            Alert.alert("Sucesso", "Movimentação cadastrada com sucesso!");

            setDestinationBranch("");
            setProduct("");
            setQuantity("");
            setObservations("");

        } catch (error) {
            console.error("Erro ao processar movimentação:", error);
            Alert.alert("Erro", "Não foi possível cadastrar a movimentação. Verifique os dados e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }}>
            <View style={styles.header}>
                <Text style={styles.textStyle}>Nova Movimentação</Text>
            </View>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: Math.max(insets.bottom + 20, 40) }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.label}>Filial de Origem</Text>
                        <View style={styles.pickerContainer}>
                            <Text style={{ padding: 15, color: "#000" }}>
                                {loggedBranchName || "Carregando..."}
                            </Text>
                        </View>

                        <Text style={styles.label}>Filial de Destino</Text>
                        <View style={[styles.pickerContainer, { zIndex: 2000 }]}>
                            <DropDownPicker
                                open={branchDropdownOpen}
                                setOpen={setBranchDropdownOpen}
                                items={branchDropdownItems}
                                setItems={setBranchDropdownItems}
                                value={destinationBranch}
                                setValue={setDestinationBranch}
                                placeholder="Selecione a filial de destino"
                                style={{
                                    borderColor: colors.greyLight,
                                    backgroundColor: colors.whiteBackground
                                }}
                                disabled={branchDropdownItems.length === 0}
                                dropDownContainerStyle={{
                                    borderColor: colors.grey,
                                    zIndex: 2000,
                                    backgroundColor: colors.whiteBackground
                                }}
                            />
                        </View>

                        <Text style={styles.label}>Produto</Text>
                        <View style={[styles.pickerContainer, { zIndex: 1000 }]}>
                            <DropDownPicker
                                open={productDropdownOpen}
                                setOpen={setProductDropdownOpen}
                                items={productDropdownItems}
                                setItems={setProductDropdownItems}
                                value={product}
                                setValue={setProduct}
                                placeholder="Selecione o produto"
                                style={{
                                    borderColor: colors.greyLight,
                                    backgroundColor: colors.whiteBackground
                                }}
                                disabled={productDropdownItems.length === 0}
                                dropDownContainerStyle={{
                                    borderColor: colors.grey,
                                    zIndex: 1000,
                                    backgroundColor: colors.whiteBackground
                                }}
                            />
                        </View>

                        {product && (
                            <Text style={styles.stockInfo}>
                                Estoque disponível: {productStock[product] || 0} unidades
                            </Text>
                        )}

                        <Text style={styles.label}>Quantidade</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Informe a quantidade"
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={setQuantity}
                            returnKeyType="done"
                            onSubmitEditing={() => {
                            }}
                        />

                        <Text style={styles.label}>Observações</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Observações"
                            multiline
                            value={observations}
                            onChangeText={setObservations}
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? "Cadastrando..." : "Cadastrar"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    scrollContent: {
        padding: 10,
        flexGrow: 1,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    pickerContainer: {
        backgroundColor: colors.whiteBackground,
        borderWidth: 1,
        borderColor: colors.greyLight,
        borderRadius: 8,
        marginBottom: 20,
        height: 50,
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#000',
    },
    pickerDisabled: {
        color: '#999',
    },
    card: {
        backgroundColor: colors.whiteBackground,
        borderRadius: 16,
        padding: 24,
        elevation: 3,
        marginTop: 8,
    },
    stockInfo: {
        fontSize: 14,
        marginTop: -8,
        marginBottom: 15,
        fontStyle: 'italic',
        color: colors.grey,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.greyLight,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        backgroundColor: colors.whiteBackground,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: colors.red,
        borderRadius: 16,
        height: 50,
        marginBottom: 2,
        alignSelf: "auto",
    },
    buttonDisabled: {
        backgroundColor: "#a0aec0",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        padding: 17,
        backgroundColor: '#4A70A8',
        width: '100%',
        height: 90,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
    textStyle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
    }
});

export default NewBranchMovement;