import React, { useState, useEffect } from 'react';

const CATEGORY_COLORS = {
  Food: '#FF6384',
  Transport: '#36A2EB',
  Entertainment: '#FFCE56',
  Utilities: '#4BC0C0',
  Other: '#9966FF',
};
import { View, Image, Text, Button, StyleSheet, TextInput, Alert, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const HomeScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0); // Default budget is $0
  const [newBudget, setNewBudget] = useState('');
  const [savingsGoal, setSavingsGoal] = useState(0); // Default savings goal is $0
  const [newSavingsGoal, setNewSavingsGoal] = useState('');
  const [savingsProgress, setSavingsProgress] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'INR', symbol: '₹' },
    { code: 'GHS', symbol: '₵' }, // Ghana Cedis
  ];

  const currencySymbol = currencies.find((curr) => curr.code === currency)?.symbol || '$';

  useEffect(() => {
    loadData();
    loadCurrency();
  }, []);

  const loadData = async () => {
    const savedExpenses = await AsyncStorage.getItem('expenses');
    const savedBudget = await AsyncStorage.getItem('budget');
    const savedSavingsGoal = await AsyncStorage.getItem('savingsGoal');
    const savedSavingsProgress = await AsyncStorage.getItem('savingsProgress');

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedBudget) setBudget(parseFloat(savedBudget));
    if (savedSavingsGoal) setSavingsGoal(parseFloat(savedSavingsGoal));
    if (savedSavingsProgress) setSavingsProgress(parseFloat(savedSavingsProgress));
  };

  const loadCurrency = async () => {
    const savedCurrency = await AsyncStorage.getItem('currency');
    if (savedCurrency) setCurrency(savedCurrency);
  };

  const handleCurrencyChange = async (itemValue) => {
    setCurrency(itemValue);
    await AsyncStorage.setItem('currency', itemValue);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  };

  const addExpense = (expense) => {
    const newExpenses = [...expenses, expense];
    setExpenses(newExpenses);
    AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
  };

  const deleteExpense = (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newExpenses = expenses.filter((expense) => expense.id !== id);
            setExpenses(newExpenses);
            AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
          },
        },
      ]
    );
  };

  const updateBudget = async () => {
    if (!newBudget || isNaN(newBudget)) {
      Alert.alert('Invalid Budget', 'Please enter a valid number for the budget.');
      return;
    }
    const updatedBudget = parseFloat(newBudget);
    setBudget(updatedBudget);
    await AsyncStorage.setItem('budget', updatedBudget.toString());
    setNewBudget('');
  };

  const clearBudget = () => {
    Alert.alert(
      'Clear Budget',
      'Are you sure you want to clear all budget data, expenses, and savings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setExpenses([]);
            setBudget(0);
            setSavingsGoal(0);
            setSavingsProgress(0);
            await AsyncStorage.removeItem('expenses');
            await AsyncStorage.removeItem('budget');
            await AsyncStorage.removeItem('savingsGoal');
            await AsyncStorage.removeItem('savingsProgress');
            Alert.alert('Budget Cleared', 'Your budget and expenses have been reset.');
          },
        },
      ]
    );
  };

  const updateSavingsGoal = async () => {
    if (!newSavingsGoal || isNaN(newSavingsGoal)) {
      Alert.alert('Invalid Savings Goal', 'Please enter a valid number for the savings goal.');
      return;
    }
    const updatedSavingsGoal = parseFloat(newSavingsGoal);
    setSavingsGoal(updatedSavingsGoal);
    await AsyncStorage.setItem('savingsGoal', updatedSavingsGoal.toString());
    setNewSavingsGoal('');
  };

  const addToSavings = async () => {
    if (!savingsAmount || isNaN(savingsAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number to add to savings.');
      return;
    }
    const amount = parseFloat(savingsAmount);
    const newProgress = savingsProgress + amount;
    setSavingsProgress(newProgress);
    await AsyncStorage.setItem('savingsProgress', newProgress.toString());
    setSavingsAmount('');
  };

  const removeFromSavings = async () => {
    if (!savingsAmount || isNaN(savingsAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number to remove from savings.');
      return;
    }
    const amount = parseFloat(savingsAmount);
    const newProgress = savingsProgress - amount;
    setSavingsProgress(newProgress);
    await AsyncStorage.setItem('savingsProgress', newProgress.toString());
    setSavingsAmount('');
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = budget - totalExpenses;

  const getSpendingInsights = () => {
    const categorySpending = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const maxCategory = Object.keys(categorySpending).reduce((a, b) =>
      categorySpending[a] > categorySpending[b] ? a : b
    , '');

    return `You're spending the most on ${maxCategory} this month.`;
  };

  const getExpenseBreakdown = () => {
    const breakdown = expenses.reduce((acc, expense) => {
      const dateParts = expense.date.split('/');
      if (dateParts.length !== 3) {
        console.warn('Invalid date format:', expense.date);
        return acc;
      }
      const [month, day, year] = dateParts;
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', expense.date);
        return acc;
      }
      const monthName = date.toLocaleString('default', { month: 'long' });
      acc[monthName] = (acc[monthName] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(breakdown).map(([month, amount]) => (
      <Text key={month} style={styles.breakdownText}>{`${month}: ${currencySymbol}${amount.toFixed(2)}`}</Text>
    ));
  };

  const chartData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(chartData).map((key) => ({
    name: key,
    amount: chartData[key],
    color: CATEGORY_COLORS[key] || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>WeBudget</Text>

      <View style={styles.currencyContainer}>
        <Text style={styles.currencyText}>Select Currency:</Text>
        <Picker
          selectedValue={currency}
          onValueChange={(itemValue) => handleCurrencyChange(itemValue)}
          style={styles.picker}
          dropdownIconColor="#000"
        >
          {currencies.map((curr) => (
            <Picker.Item key={curr.code} label={`${curr.code} (${curr.symbol})`} value={curr.code} />
          ))}
        </Picker>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Budget Details</Text>
        <Text style={styles.budgetText}>Total Budget: {currencySymbol}{budget.toFixed(2)}</Text>
        <Text style={styles.budgetText}>Total Spent: {currencySymbol}{totalExpenses.toFixed(2)}</Text>
        <Text style={styles.budgetText}>Remaining: {currencySymbol}{remainingBudget.toFixed(2)}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter new budget"
          keyboardType="numeric"
          value={newBudget}
          onChangeText={setNewBudget}
        />
        <Button title="Update Budget" onPress={updateBudget} style={styles.buttonMargin}/>
        <Button title="Clear Budget" onPress={clearBudget} color="red" style={styles.buttonMargin}/>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Savings Details</Text>
        <Text style={styles.savingsText}>Savings Goal: {currencySymbol}{savingsGoal.toFixed(2)}</Text>
        <Text style={styles.savingsText}>Progress: {currencySymbol}{savingsProgress.toFixed(2)}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter new savings goal"
          keyboardType="numeric"
          value={newSavingsGoal}
          onChangeText={setNewSavingsGoal}
        />
        <Button title="Update Savings Goal" onPress={updateSavingsGoal} />

        <TextInput
          style={styles.input}
          placeholder="Enter amount to add or remove"
          keyboardType="numeric"
          value={savingsAmount}
          onChangeText={setSavingsAmount}
        />
        <Button title="Add to Savings" onPress={addToSavings} style={styles.buttonMargin}/>

        
        <Button title="Remove from Savings" onPress={removeFromSavings} color="red" style={styles.buttonMargin}/>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Expenses Details</Text>
        <Text style={styles.insightText}>{getSpendingInsights()}</Text>

        <Button title="Add Expense" onPress={() => navigation.navigate('AddExpense', { addExpense })} />

        {expenses.length > 0 ? (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>Expense Distribution</Text>
    <PieChart
      data={pieChartData}
      width={Dimensions.get('window').width - 32}
      height={200}
      chartConfig={{
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      }}
      accessor="amount"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute
    />
  </View>
) : (
<View style={styles.noExpensesContainer}>
  {/* Use Image for local PNG file */}
  <Image 
    source={require('../assets/Expense_display.png')} // Correct path to the image
    style={styles.image} // Apply the image styling from the stylesheet
  />
  
  <Text style={styles.noExpensesText}>No expenses to display.</Text>
</View>

)}

        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Monthly Expense Breakdown</Text>
          {getExpenseBreakdown()}
        </View>

        <ScrollView>
          {expenses.map((item) => (
            <View key={item.id} style={styles.expenseItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.expenseText}>{item.category}: {currencySymbol}{item.amount.toFixed(2)}</Text>
                <Text style={styles.expenseText}>{item.date}</Text>
              </View>
              <Button title="Delete" onPress={() => deleteExpense(item.id)} color="red" />
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  buttonMargin: {
    marginBottom: 40, 
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff', // Light background
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#000' }, // Black text
  currencyContainer: {
    marginBottom: 16,
  },
  currencyText: {
    fontSize: 16,
    color: '#000', // Black text
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#fff', // White background
    color: '#000', // Black text
  },
  categoryContainer: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9', // Light gray background for cards
    padding: 16,
    borderRadius: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000', // Black text
  },
  budgetText: { fontSize: 16, marginBottom: 8, color: '#000' }, // Black text
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  savingsText: { fontSize: 16, marginBottom: 8, color: '#000' }, // Black text
  insightText: { fontSize: 16, fontStyle: 'italic', marginBottom: 16, color: '#000' }, // Black text
  chartContainer: { marginBottom: 16 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#000' }, // Black text
  noExpensesText: { fontSize: 16, textAlign: 'center', marginBottom: 16, color: '#000' }, // Black text
  breakdownContainer: { marginBottom: 16 },
  breakdownTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#000' }, // Black text
  breakdownText: { fontSize: 16, color: '#000' }, // Black text
  expenseItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff', // White background for expense items
    marginBottom: 8,
    borderRadius: 4,
  },
  expenseText: {
    color: '#000', // Black text
  },
  noExpensesContainer: {
    flex: 1, // Take up full screen
    justifyContent: 'center', // Centers the content vertically
    alignItems: 'center', // Centers the content horizontally
    backgroundColor: '#fff', // Optional background color
    padding:50,
  },
});

export default HomeScreen;