import React, { useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    FlatList,
    View,
    Image,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableOpacity,
    Alert,
} from "react-native";
import axios from "axios";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
    GestureHandlerRootView,
    ScrollView,
    TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import Header from "../../Components/Header";

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
    url: string;
    price: number;
    category: string;
    description: string;
}

type Props = {
    navigation: NavigationProp<any>;
};

export default function RegisterProducts({ navigation }: Props) {
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [value, setValue] = useState("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit() {
        setErrorMessage("");

        if (!url || !name || !amount || !value || !brand || !description) {
            setErrorMessage("Ops, faltou preencher algum campo!");
            return;
        }

        axios
            .post(process.env.EXPO_PUBLIC_API_URL + "/products", {
                name: name,
                url_cover: url,
                brand: brand,
                amount: parseFloat(amount),
                value: parseFloat(value),
                description: description,
            })
            .then((response) => {
                Alert.alert("Produto cadastrado com sucesso!");
                navigation.navigate("ListProducts");
            })
            .catch(() => {
                Alert.alert(
                    "Erro ao cadastrar produto, tente novamente em alguns instantes."
                );
            });
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, width: "100%" }}>
                <Header />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
                    style={styles.container}
                >
                    <Text style={styles.textStyle}>
                        Cadastrar novo produto
                    </Text>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableWithoutFeedback
                            onPress={Keyboard.dismiss}
                            style={{ width: "auto" }}
                        >
                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.subtitleStyle}>
                                        URL da imagem
                                    </Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        value={url}
                                        onChangeText={setUrl}
                                        placeholder="http://..."
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.subtitleStyle}>
                                        Nome do produto
                                    </Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.subtitleStyle}>
                                        Quantidade de entrada
                                    </Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="number-pad"
                                        placeholder="Insira a quantidade"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.subtitleStyle}>
                                        Preço
                                    </Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        value={value}
                                        onChangeText={setValue}
                                        keyboardType="decimal-pad"
                                        placeholder="Preço por unidade"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.subtitleStyle}>
                                        Marca
                                    </Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        value={brand}
                                        onChangeText={setBrand}
                                        placeholder="Informe a marca ou laboratório"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.subtitleStyle}>
                                        Descrição
                                    </Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        value={description}
                                        onChangeText={setDescription}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        {errorMessage ? (
                            <Text style={styles.errorMessage}>
                                {errorMessage}
                            </Text>
                        ) : null}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Cadastrar</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ebebeb",
        justifyContent: "flex-start",
        width: "100%",
    },
    scroll: {
        width: "100%",
    },
    form: {
        flex: 1,
        width: "90%",
        alignSelf: "center",
        marginVertical: 10,
    },
    button: {
        width: "90%",
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
        fontSize: 18,
        color: "#ffffff",
        fontWeight: "500",
        alignSelf: "center",
    },
    errorMessage: {
        fontSize: 16,
        fontWeight: "500",
        color: "#ff0000",
        alignSelf: "center",
    },
    inputStyle: {
        width: "100%",
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        marginTop: 10,
    },
    productImage: {
        width: 100,
        height: 100,
        resizeMode: "contain",
        marginBottom: 10,
    },
    inputTitle: {
        fontSize: 15,
        color: "black",
        marginBottom: 10,
    },
    titleStyle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "black",
        marginBottom: 10,
    },
    inputContainer: {
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    subtitleStyle: {
        fontSize: 16,
        fontWeight: "500",
        alignSelf: "flex-start",
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4A70A8",
        width: "100%",
        height: 90,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
    textStyle: {
        fontSize: 20,
        fontWeight: "500",
        color: "#000000",
        textAlign: "center",
        paddingTop: 25
    }
});
