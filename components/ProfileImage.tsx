import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import {
  launchImagePicker,
  uploadImageAsync,
} from "../utils/imagePickerHelper";
import { updateSignedInUserData } from "../utils/actions/authActions";
import { updateLoggedInUserData } from "../store/authSlice";
import { updateChatData } from "../utils/actions/chatActions";

const userImage = require("../assets/images/userImage.jpeg");

interface ProfileImageProps {
  userId: string;
  chatId?: string;
  uri: string | undefined;
  size: number;
  showEditButton: boolean;
  showRemoveButton: boolean;
  style?: Record<string, number | string>;
  onPress?: () => void;
}

const ProfileImage: React.FC<ProfileImageProps> = (props) => {
  const dispatch = useDispatch();

  const source = props.uri ? { uri: props.uri } : userImage;

  const [image, setImage] = useState(source);
  const [isLoading, setIsLoading] = useState(false);

  const userId = props.userId;
  const chatId = props.chatId;

  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker();

      if (!tempUri) return;

      // Upload the image
      setIsLoading(true);
      const uploadUrl = await uploadImageAsync(tempUri, chatId !== undefined);
      setIsLoading(false);

      if (!uploadUrl) {
        throw new Error("Could not upload image");
      }

      if (chatId) {
        await updateChatData(chatId, userId, { chatImage: uploadUrl });
      } else {
        const newData = { profilePicture: uploadUrl };

        await updateSignedInUserData(userId, newData);
        dispatch(updateLoggedInUserData({ newData }));
      }

      setImage({ uri: uploadUrl });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const showEditButtonProp = props.showEditButton && pickImage;
  const onPressDisabled = () => {};
  const isThereOnPress = props.onPress;
  const onPressProfileImage =
    showEditButtonProp || isThereOnPress || onPressDisabled;

  return (
    <TouchableOpacity style={props.style} onPress={onPressProfileImage}>
      {isLoading ? (
        <View
          style={{
            ...styles.loadingContainer,
            ...{ width: props.size, height: props.size },
          }}
        >
          <ActivityIndicator size={"small"} color={colors.pink} />
        </View>
      ) : (
        <Image
          style={{
            ...styles.image,
            ...{ width: props.size, height: props.size },
          }}
          source={image}
        />
      )}

      {props.showEditButton && !isLoading && (
        <View style={styles.editIconContainer}>
          <FontAwesome name="pencil" size={15} color="black" />
        </View>
      )}

      {props.showRemoveButton && !isLoading && (
        <View style={styles.removeIconContainer}>
          <FontAwesome name="close" size={15} color="black" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 50,
    borderColor: colors.grey,
    borderWidth: 1,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  removeIconContainer: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    padding: 3,
  },
});

export default ProfileImage;
