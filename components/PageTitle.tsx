import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

interface PageTitleProps {
  text: string;
}

const PageTitle: React.FC<PageTitleProps> = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{props.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  text: {
    fontSize: 28,
    color: colors.textColor,
    fontFamily: "boldRegular",
    letterSpacing: 0.3,
  },
});

export default PageTitle;
