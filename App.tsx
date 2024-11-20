import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, LogBox } from "react-native";
import { Provider } from "react-redux";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import "react-native-gesture-handler";

import AppNavigator from "./navigation/AppNavigator";
import { store } from "./store/store";

LogBox.ignoreLogs(["AsyncStorage has been extracted"]);
// AsyncStorage.clear();

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appIsLoaded, setAppIsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await Font.loadAsync({
          black: require("../../Desktop/Messenger_RN/assets/fonts//Roboto-Black.ttf"),
          blackItalic: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-BlackItalic.ttf"),
          boldRegular: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-Bold.ttf"),
          boldItalic: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-BoldItalic.ttf"),
          italic: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-Italic.ttf"),
          light: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-Light.ttf"),
          lightItalic: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-LightItalic.ttf"),
          medium: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-Medium.ttf"),
          mediumItalic: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-MediumItalic.ttf"),
          regular: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-Regular.ttf"),
          thin: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-Thin.ttf"),
          thinItalic: require("../../Desktop/Messenger_RN/assets/fonts/Roboto-ThinItalic.ttf"),
        });
      } catch (error) {
        console.log(error);
      } finally {
        setAppIsLoaded(true);
      }
    };

    prepare().catch(() => {});
  }, []);

  const onLayout = useCallback(async () => {
    if (appIsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsLoaded]);

  if (!appIsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider style={styles.container} onLayout={onLayout}>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  label: {
    color: "black",
    fontSize: 18,
    fontFamily: "regular",
  },
});
