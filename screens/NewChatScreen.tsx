import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import PageContainer from "../components/PageContainer";
import CustomHeaderButton from "../components/CustomHeaderButton";
import DataItem from "../components/DataItem";
import { RootStackParamList } from "../types";
import { colors } from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import { searchUsers } from "../utils/actions/userActions";
import { Users } from "../types";

interface NewChatScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const NewChatScreen: React.FC<NewChatScreenProps> = ({ navigation }) => {
  const [meId, setMeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<Users | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <CustomHeaderButton
            name="close"
            onPress={() => navigation.goBack()}
          />
        );
      },
      headerTitle: "New chat",
    });
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === "") {
        setUsers(null);
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);

      const usersResult = (await searchUsers(searchTerm)) ?? {};

      if (meId in usersResult) {
        delete usersResult[meId];
      }

      setUsers(usersResult);

      if (usersResult) {
        setNoResultsFound(false);
      } else {
        setNoResultsFound(true);
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  useEffect(() => {
    const parseUserData = async () => {
      try {
        const data = await AsyncStorage.getItem("userData");
        if (data !== null) {
          const parsedData = JSON.parse(data);
          setMeId(parsedData.userId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    parseUserData().catch(() => {});
  }, []);

  return (
    <PageContainer>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={15} color={colors.lightGrey} />

        <TextInput
          placeholder="Search"
          style={styles.searchBox}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>

      {isLoading && (
        <View style={commonStyles.center}>
          <ActivityIndicator size={"large"} color={colors.pink} />
        </View>
      )}

      {!isLoading && !noResultsFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={(itemData) => {
            const userId = itemData.item;
            const userData = users[userId];

            return (
              <DataItem
                userId={userData.userId}
                title={`${userData.firstName} ${userData.lastName}`}
                subTitle={userData.about}
                image={userData.profilePicture ?? ""}
              />
            );
          }}
        />
      )}

      {!isLoading && noResultsFound && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="question"
            size={55}
            color={colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>No users found!</Text>
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.extraLightGrey,
    height: 30,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: "100%",
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: colors.textColor,
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
});

export default NewChatScreen;
