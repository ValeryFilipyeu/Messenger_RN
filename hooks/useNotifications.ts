import React, { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { StackActions, useNavigation } from "@react-navigation/native";

import { registerForPushNotifications } from "../utils/registerForPushNotifications";

const useNotifications = (): void => {
  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  // console.log(expoPushToken)
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotifications().then((token) =>
      setExpoPushToken(String(token)),
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Handle received notification
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        const chatId: string = data["chatId"];

        if (chatId) {
          const pushAction = StackActions.push("ChatScreen", { chatId });
          navigation.dispatch(pushAction);
        } else {
          console.log("No chat id sent with notification");
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
};

export default useNotifications;
