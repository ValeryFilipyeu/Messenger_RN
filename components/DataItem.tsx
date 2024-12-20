import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import ProfileImage from "./ProfileImage";

interface DataItemProps {
  userId: string;
  title: string;
  subTitle?: string;
  image: string;
  onPress: () => void;
  type: "checkbox" | "item" | "link" | "button";
  isChecked?: boolean;
  icon?: "plus";
  hideImage?: boolean;
}

const imageSize = 40;

const DataItem: React.FC<DataItemProps> = ({
  title,
  subTitle,
  image,
  userId,
  onPress,
  type,
  isChecked,
  icon,
  hideImage,
}) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        {!icon && !hideImage && (
          <ProfileImage
            userId={userId}
            uri={image}
            size={imageSize}
            showEditButton={false}
            showRemoveButton={false}
          />
        )}

        {icon && (
          <View style={styles.leftIconContainer}>
            <AntDesign name={icon} size={20} color={colors.blue} />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={{
              ...styles.title,
              ...{ color: type === "button" ? colors.blue : colors.textColor },
            }}
          >
            {title}
          </Text>

          {subTitle && (
            <Text numberOfLines={1} style={styles.subTitle}>
              {subTitle}
            </Text>
          )}
        </View>

        {type === "checkbox" && (
          <View
            style={{
              ...styles.iconContainer,
              ...(isChecked && styles.checkedStyle),
            }}
          >
            <Ionicons name="checkmark" size={18} color="white" />
          </View>
        )}

        {type === "link" && (
          <View>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={colors.grey}
            />
          </View>
        )}
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
  iconContainer: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGrey,
    backgroundColor: "white",
  },
  checkedStyle: {
    backgroundColor: colors.pink,
    borderColor: "transparent",
  },
  leftIconContainer: {
    backgroundColor: colors.extraLightGrey,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: imageSize,
    height: imageSize,
  },
});

export default DataItem;
