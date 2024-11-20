import React from "react";
import { StyleSheet, View } from "react-native";

interface PageContainerProps {
  style?: Record<string, number | string>;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = (props) => {
  return (
    <View style={{ ...styles.container, ...props.style }}>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: "white",
  },
});

export default PageContainer;
