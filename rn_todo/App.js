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

const MyStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <MyStack.Navigator>
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
