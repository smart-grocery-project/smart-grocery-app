import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: '700',
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Smart Grocery', headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Home', headerBackVisible: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
