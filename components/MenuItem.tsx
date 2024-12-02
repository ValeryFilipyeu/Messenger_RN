import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MenuOption } from "react-native-popup-menu";
import { FontAwesome } from "@expo/vector-icons";

interface MenuItemProps {
  text: string;
  icon: "copy" | "star" | "star-o";
  onSelect: () => Promise<void>;
}

const MenuItem: React.FC<MenuItemProps> = ({ text, icon, onSelect }) => {
  return (
    <MenuOption onSelect={onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{text}</Text>
        <FontAwesome name={icon} size={18} />
      </View>
    </MenuOption>
  );
};

const styles = StyleSheet.create({
  menuItemContainer: {
    flexDirection: "row",
    padding: 5,
  },
  menuText: {
    flex: 1,
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontSize: 16,
  },
});

export default MenuItem;
