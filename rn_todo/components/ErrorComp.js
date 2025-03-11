import { View, Text } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { CircleAlert } from "lucide-react-native";

const ErrorComp = ({ timeDur, errorMessage, setErrorMessage }) => {
  const errorMessageOpacity = useSharedValue(0);

  useEffect(() => {
    if (errorMessage) {
      // Fade in with ease-in-out easing
      errorMessageOpacity.value = withTiming(1, {
        duration: timeDur,
      });

      // Fade out smoothly after 2 seconds
      // Fade out after 3 seconds
      setTimeout(() => {
        errorMessageOpacity.value = withTiming(0, {
          duration: timeDur,
        });
        // Clear message after fade-out animation completes
        setTimeout(() => {
          setErrorMessage("");
        }, timeDur); // Delay clear to match fade-out duration
      }, timeDur * 3);
    }
  }, [errorMessage]);

  if (!errorMessage) return;

  return (
    <Animated.View
      style={{
        opacity: errorMessageOpacity,
        transition: { duration: 300 },
      }}
      className="bg-red-200 flex w-full rounded-lg p-4 mt-4 flex-row justify-between items-center"
    >
      <CircleAlert fill={"#dc2626"} color={"#fecaca"} size={30} />
      <Text className="text-red-700 text-lg text-center font-medium">
        {errorMessage}
      </Text>
      <View className=" w-2 h-2" />
    </Animated.View>
  );
};

export default ErrorComp;
