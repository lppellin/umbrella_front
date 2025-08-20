import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../styles/colors/colors';

interface Movement {
  id: string;
  product: { name: string; url_cover?: string; };
  quantity: number;
  destinationBranch: { name: string; };
  status: string;
}

export const CurrentMovement = () => {
  const [movement, setMovement] = useState<Movement | null>(null);

  useEffect(() => {
    fetchCurrentMovement();
  }, []);

  async function fetchCurrentMovement() {
    try {
      const res = await api.get('/movements/current');
      setMovement(res.data);
    } catch {
      Alert.alert('Erro ao carregar movimentação atual.');
    }
  }

  async function handleFinish() {
    if (!movement) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        name: 'comprovante.jpg',
        type: 'image/jpeg',
      } as any);

      try {
        await api.patch(`/movements/${movement.id}/end, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }`);
        Alert.alert('Entrega finalizada!');
        setMovement(null);
      } catch (err: any) {
        Alert.alert('Erro ao finalizar', err.response?.data?.message || '');
      }
    }
  }

  if (!movement) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nenhuma movimentação em andamento.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {movement.product.url_cover && (
        <Image source={{ uri: movement.product.url_cover }} style={styles.image} />
      )}
      <Text style={styles.title}>{movement.product.name}</Text>
      <Text style={styles.text}>Quantidade: {movement.quantity}</Text>
      <Text style={styles.text}>Destino: {movement.destinationBranch.name}</Text>
      <Text style={styles.status}>Status: {movement.status}</Text>
      <TouchableOpacity style={styles.button} onPress={handleFinish}>
        <Text style={styles.buttonText}>Finalizar Entrega</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.background },
  message: { fontSize: 16, color: colors.detail },
  card: { backgroundColor: '#fff', padding: 16, margin: 20, borderRadius: 10, elevation: 3 },
  image: { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.title, marginBottom: 8 },
  text: { color: colors.detail, marginBottom: 4 },
  status: { color: colors.primary, fontWeight: 'bold', marginBottom: 6 },
  button: { backgroundColor: colors.danger, padding: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});