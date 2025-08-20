import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';
import { formatCpf } from '../../utils/formatCpf';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../../Components/Header';

const UserRegistrationScreen = () => {
    const [selectedForm, setSelectedForm] = useState('DRIVER');
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [urlCover, setUrlCover] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        setName('');
        setDocument('');
        setEmail('');
        setUrlCover('');
        setStreet('');
        setCity('');
        setNeighborhood('');
        setNumber('');
        setComplement('');
        setState('');
        setZipCode('');
        setPassword('');
    }, [selectedForm]);

    const validateForm = () => {
        if (!name) return Alert.alert("Erro", "Preencha o nome");

        if (!email) return Alert.alert("Erro", "Preencha o email");

        if (selectedForm === 'DRIVER' && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(document)) {
            return Alert.alert("Erro", "CPF inválido");
        }

        if (!street || !city || !neighborhood || !number || !state || !zipCode) {
            return Alert.alert("Erro", "Preencha todos os campos de endereço");
        }

        if (!/^\d{5}-?\d{3}$/.test(zipCode)) {
            return Alert.alert("Erro", "CEP inválido");
        }

        if (!password || password.length < 6) return Alert.alert("Erro", "A senha deve ter ao menos 6 caracteres");

        if (password !== confirmPassword) return Alert.alert("Erro", "As senhas não coincidem");
        return true;
    };

    const handleChangeDocument = (value: string) => {
        if (selectedForm === 'DRIVER') {
            setDocument(formatCpf(value));
        } else {
            setDocument(value);
        }
    };

    const clearForm = () => {
        setName('');
        setDocument('');
        setEmail('');
        setUrlCover('');
        setStreet('');
        setCity('');
        setNeighborhood('');
        setNumber('');
        setComplement('');
        setState('');
        setZipCode('');
        setPassword('');
        setConfirmPassword('');
    };


    const handleSubmit = async () => {
        if (!validateForm()) return;

        const register = {
            name,
            document,
            email,
            url_cover: urlCover,
            rua: street,
            cidade: city,
            bairro: neighborhood,
            numero: number,
            complemento: complement,
            estado: state,
            cep: zipCode,
            password,
            profile: selectedForm,
        };
        setLoading(true);
        console.log(register)
        try {
            await api.post('/user', register, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
            clearForm();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message;

            if (errorMessage.toLowerCase().includes('email')) {
                Alert.alert('Erro', 'Este email já está cadastrado.');
            } else {
                Alert.alert('Erro', 'Falha ao cadastrar usuário.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Header />
                    <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
                        <View style={styles.loginHeader}>
                            <Text style={styles.loginText}>Selecione o Perfil</Text>
                        </View>
                        <Picker
                            selectedValue={selectedForm}
                            onValueChange={(itemValue) => setSelectedForm(itemValue)}
                            style={styles.picker}

                        >
                            <Picker.Item label="Motorista" value="DRIVER" />
                            <Picker.Item label="Filial" value="BRANCH" />
                        </Picker>

                        <View style={styles.loginHeader}>
                            <FontAwesome name="user" size={20} color="#333" style={styles.icon} />
                            <Text style={styles.loginText}>Dados Usuário</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome completo"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={selectedForm === 'DRIVER' ? "CPF" : "CNPJ"}
                            value={document}
                            onChangeText={handleChangeDocument}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="URL da Foto"
                            value={urlCover}
                            onChangeText={setUrlCover}
                        />
                        <View style={styles.loginHeader}>
                            <FontAwesome name="map-marker" size={20} color="#333" style={styles.icon} />
                            <Text style={styles.loginText}>Endereço</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Rua"
                            value={street}
                            onChangeText={setStreet}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Número"
                            value={number}
                            onChangeText={setNumber}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Complemento"
                            value={complement}
                            onChangeText={setComplement}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Bairro"
                            value={neighborhood}
                            onChangeText={setNeighborhood}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Cidade"
                            value={city}
                            onChangeText={setCity}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Estado"
                            value={state}
                            onChangeText={setState}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="CEP"
                            value={zipCode}
                            onChangeText={setZipCode}
                        />
                        <View style={styles.loginHeader}>
                            <FontAwesome name="envelope" size={20} color="#333" style={styles.icon} />
                            <Text style={styles.loginText}>Dados de Login</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            value={password}
                            secureTextEntry
                            onChangeText={setPassword}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar Senha"
                            value={confirmPassword}
                            secureTextEntry
                            onChangeText={setConfirmPassword}
                        />

                        <View style={styles.submitButton}>
                            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Text style={styles.submitText}>Cadastrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#606060',
        justifyContent: 'center',
    },
    form: {
        padding: 20,
        backgroundColor: '#F0F2F5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 5,
        maxHeight: '88%',
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 30,
    },
    submitButton: {
        backgroundColor: '#D35D5D',
        padding: 15,
        marginTop: 15,
        marginBottom: 40,
        borderRadius: 100,
    },
    submitText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 10,
        marginBottom: 20,
        borderRadius: 20,
    },
    loginHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    loginText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 5,
    },
    icon: {
        marginRight: 5,
    },
});

export default UserRegistrationScreen;