import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import Preloader from './screens/Preloader';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? <Preloader /> : <AppNavigator />}
    </View>
  );
};

export default App;