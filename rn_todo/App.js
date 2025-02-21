import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import FlashcardScreen from "./screens/FlashcardScreen";
import RecordingScreen from "./screens/RecordingScreen";

const MyStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <MyStack.Navigator>
        <MyStack.Screen name="Home" component={HomeScreen} />
        <MyStack.Screen name="Flashcard" component={FlashcardScreen} />
        <MyStack.Screen name="Record" component={RecordingScreen} />
      </MyStack.Navigator>
    </NavigationContainer>
  );
}
