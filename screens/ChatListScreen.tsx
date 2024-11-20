import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomHeaderButton from "../components/CustomHeaderButton";
import { RootStackParamList } from "../types";

interface ChatListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <CustomHeaderButton
            name="create-outline"
            onPress={() => navigation.navigate("NewChat")}
          />
        );
      },
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Chat List Screen</Text>

      <Button
        title="Go to Chat Screen"
        onPress={() => {
          navigation.navigate("ChatScreen");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatListScreen;
