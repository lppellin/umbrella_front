import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    FlatList,
    View,
    Image,
    TouchableOpacity,
} from "react-native";
import axios from "axios";
import Header from "../../Components/Header";
import BranchMenu from "../../Components/BranchMenu";
import { useNavigation } from "@react-navigation/native";
import api from "../../services/api";

interface ProductsType {
    id: number;
    name: string;
    branch: {
        id: string;
        user: {
            name: string;
        };
    };
    amount: number;
    url_cover: string;
    description: string;
    value: number;
    brand: string;
}

export default function ListProducts() {
    const navigation = useNavigation<any>();
    const [products, setProducts] = useState<ProductsType[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductsType[]>(
        []
    );
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProducts = () => {
        axios
            api.get(process.env.EXPO_PUBLIC_API_URL + '/products')
            .then((response) => {
                setProducts(response.data);
                setFilteredProducts(response.data);
            })
            .catch((error) => {
                console.error("Erro ao buscar produtos:", error);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filterProducts = () => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = products.filter(
            (product) =>
                product.name?.toLowerCase().includes(lowercasedFilter) ||
                product.branch.id?.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredProducts(filteredData);
    };

    const renderProduct = ({ item }: { item: ProductsType }) => (
        <View style={styles.productCard}>
            <View style={styles.productInfo}>
                <View style={styles.imageStyle}>
                    <Image
                        source={{ uri: item.url_cover }}
                        style={styles.productImage}
                    />
                </View>
                <View style={styles.styleSection}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text style={styles.stockInfo}>R${item.value}</Text>
                </View>
            </View>
            <View style={styles.alignSection}>
                <Text style={styles.stockInfo}>
                    Filial: {item.branch.user.name}
                </Text>
                <Text style={styles.stockInfo}>
                    Saldo Disponível: {item.amount}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <BranchMenu
                selected="products"
                onPressMovements={() =>
                    navigation.navigate("BranchMovementList")
                }
                onPressProducts={() => navigation.navigate("ListProducts")}
            />
            <View style={styles.alignButton}>
                <Text style={styles.title}>Listagem de produtos</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("RegisterProducts")}
                >
                    <Text style={styles.buttonText}>Cadastrar</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome ou filial"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={filterProducts}
            />
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) =>
                    item?.id?.toString() || Math.random().toString()
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ebebeb",
    },
    icon: {
        width: 44,
        height: 44
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 15,
        padding: 17,
        backgroundColor: '#4A70A8',
        width: '100%',
        height: 90,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        zIndex: 10
    },    
    textStyle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#ffffff'
    },
    button: {
        width: 100,
        height: 42,
        backgroundColor: "#d35d5d",
        fontSize: 15,
        fontWeight: "bold",
        borderRadius: 8,
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "500",
        alignSelf: "center",
    },
    alignButton: {
        justifyContent: "center",
        gap: 80,
        flexDirection: "row",
    },
    searchInput: {
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 10,
        margin: 15,
        backgroundColor: "#fff",
    },
    productCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        margin: 15,
        alignContent: "center",
    },
    imageStyle: {
        padding: 10,
    },
    styleSection: {
        width: 286,
        alignItems: "flex-start",
        padding: 10,
    },
    productInfo: {
        flexDirection: "row",
    },
    productImage: {
        width: 100,
        height: 100,
        resizeMode: "contain",
        marginBottom: 10,
    },
    productName: {
        fontSize: 17,
        fontWeight: "bold",
        color: "black",
        marginBottom: 10,
    },
    description: {
        width: "100%",
        color: "#585858",
        marginBottom: 15,
    },
    alignSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: 50,
        backgroundColor: "#4a70a861",
        borderBottomStartRadius: 12,
        borderBottomEndRadius: 12,
        paddingHorizontal: 10,
    },
    stockInfo: {
        fontSize: 14,
        color: "#000000",
        fontWeight: "500",
    },
    productQuantity: {
        fontSize: 14,
        color: "black",
        fontWeight: "500",
    },
    title: {
        fontSize: 20,
        fontWeight: "500",
        alignSelf: "center",
        marginTop: 25,
        marginBottom: 10,
    },
});
