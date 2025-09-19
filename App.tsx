import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './components/SplashScreen';
import InicioScreen from './ui/screens/Inicio/InicioScreen';
import JergaBasicaScreen from './ui/screens/JergaBasica/JergaBasicaScreen';
import TiendaScreen from './ui/screens/Tienda/TiendaScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ImageBackground
          source={require('./assets/FONDO2.png')}
          style={styles.background}
          resizeMode="cover"
        >
          {isLoading ? (
            <SplashScreen onLoadingComplete={handleLoadingComplete} renderBackground={false} />
          ) : (
            <NavigationContainer>
              <Stack.Navigator 
                initialRouteName="Inicio"
                screenOptions={{
                  headerShown: false,
                  cardStyle: { backgroundColor: 'transparent' },
                  cardStyleInterpolator: ({ current, layouts }) => {
                    return {
                      cardStyle: {
                        transform: [
                          {
                            translateX: current.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [layouts.screen.width, 0],
                            }),
                          },
                        ],
                      },
                    };
                  },
                  transitionSpec: {
                    open: {
                      animation: 'timing',
                      config: {
                        duration: 300,
                      },
                    },
                    close: {
                      animation: 'timing',
                      config: {
                        duration: 300,
                      },
                    },
                  },
                }}
              >
                <Stack.Screen name="Inicio" component={InicioScreen} />
                <Stack.Screen name="JergaBasica" component={JergaBasicaScreen} />
                <Stack.Screen name="Tienda" component={TiendaScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          )}
          <StatusBar style="auto" />
        </ImageBackground>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
