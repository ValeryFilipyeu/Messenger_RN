import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { colors } from "../constants/colors";
import ProfileImage from "./ProfileImage";

interface DataItemProps {
  userId: string;
  title: string;
  subTitle?: string;
  image: string;
}

const DataItem: React.FC<DataItemProps> = ({ title, subTitle, image, userId }) => {
  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <ProfileImage userId={userId} uri={image} size={40} showEditButton={false} />

        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>

          {subTitle && (
            <Text numberOfLines={1} style={styles.subTitle}>
              {subTitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 7,
    borderBottomColor: colors.extraLightGrey,
    borderBottomWidth: 1,
    alignItems: "center",
    minHeight: 50,
  },
  textContainer: {
    marginLeft: 14,
  },
  title: {
    fontFamily: "medium",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  subTitle: {
    fontFamily: "regular",
    color: colors.grey,
    letterSpacing: 0.3,
  },
});

export default DataItem;
