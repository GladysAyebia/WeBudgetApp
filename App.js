import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import Preloader from './screens/Preloader';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds delay
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? <Preloader /> : <AppNavigator />}
    </View>
  );
};

export default App;