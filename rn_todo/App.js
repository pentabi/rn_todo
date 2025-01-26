import { StatusBar } from "expo-status-bar";
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Task from "./components/task";
import { useState } from "react";

export default function App() {
  const [taskList, setTaskList] = useState([
    { id: 1, title: "Buy groceries" },
    { id: 2, title: "Walk the dog" },
    { id: 3, title: "Read a book" },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = (newTask) => {
    Keyboard.dismiss();
    newTask = { id: taskList.length + 1, title: newTask };
    let addedTaskList = [...taskList, newTask];
    setTaskList(addedTaskList);
    setNewTask(null);
    console.log("Added task");
  };

  return (
    <View className="flex-1 pt-12 px-6 bg-white">
      <Text className="text-lg">Todo List</Text>
      {/* ItemList */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {taskList.map((task) => {
            return <Task key={task.id} id={task.id} title={task.title} />;
          })}
        </View>
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ height: 100, width: "100%" }}
        className="bg-green-50 justify-between items-center flex-row"
      >
        <TextInput
          className="bg-white p-2 w-4/5"
          placeholder="write task"
          value={newTask}
          onChangeText={(text) => setNewTask(text)}
        ></TextInput>
        <TouchableOpacity className="p-2 px-4" onPress={() => addTask(newTask)}>
          <Text>+</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}
