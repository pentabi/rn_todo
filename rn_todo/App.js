import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import FlashcardScreen from "./screens/FlashcardScreen";
import RecordingScreen from "./screens/RecordingScreen";
import SignInScreen from "./screens/auth/SignInScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import LoginWelcomeScreen from "./screens/auth/LoginWelcomeScreen";
import EmailVerificationScreen from "./screens/auth/EmailVerificationScreen";
import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";

const MyStack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const getInitialRouteName = () => {
    if (isLoggedIn) {
      return isVerified ? "Home" : "EmailVerification";
    } else {
      return "SignIn";
    }
  };

  if (initializing) return null;

  const isLoggedIn = !!user;
  const isVerified = user?.emailVerified;

  return (
    <NavigationContainer>
      <MyStack.Navigator
        initialRouteName={
          isLoggedIn ? (isVerified ? "Home" : "EmailVerification") : "SignIn"
        }
        screenOptions={{ headerShown: false }}
      >
        <MyStack.Screen name="Home" component={HomeScreen} />
        <MyStack.Screen name="Flashcard" component={FlashcardScreen} />
        <MyStack.Screen name="Record" component={RecordingScreen} />
        <MyStack.Screen name="SignIn" component={SignInScreen} />
        <MyStack.Screen name="SignUp" component={SignUpScreen} />
        <MyStack.Screen name="Welcome" component={LoginWelcomeScreen} />
        <MyStack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
        />
      </MyStack.Navigator>
    </NavigationContainer>
  );
}
