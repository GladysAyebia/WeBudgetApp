import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';


const AddExpenseScreen = ({ route, navigation }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');

  const { addExpense } = route.params;

  const handleSave = () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number for the amount.');
      return;
    }
    const selectedCategory = category === 'Other' ? customCategory : category;
    if (category === 'Other' && !customCategory) {
      Alert.alert('Invalid Category', 'Please enter a custom category.');
      return;
    }
    const expense = {
      id: Math.random().toString(),
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date().toLocaleDateString(),
    };
    addExpense(expense);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Transport" value="Transport" />
        <Picker.Item label="Entertainment" value="Entertainment" />
        <Picker.Item label="Utilities" value="Utilities" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      {category === 'Other' && (
        <TextInput
          style={styles.input}
          placeholder="Enter custom category"
          value={customCategory}
          onChangeText={setCustomCategory}
        />
      )}
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  picker: {
    marginBottom: 16,
  },
});

export default AddExpenseScreen;