import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Task from "./components/task";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
import { db, readFirebase, testFirebase } from "./firebaseConfig";

export default function App() {
  const sampleTaskList = [
    { id: 1, title: "Buy groceries", completed: false },
    { id: 2, title: "Walk the dog", completed: false },
    { id: 3, title: "Read a book", completed: false },
  ];

  useEffect(() => {
    readFirebase();
  }, []);

  const [taskList, setTaskList] = useState(sampleTaskList);
  const [newTask, setNewTask] = useState("");

  const addTask = (newTask) => {
    Keyboard.dismiss();
    const nextId =
      taskList.length > 0
        ? Math.max(...taskList.map((task) => task.id)) + 1
        : 1;
    const newTaskObj = { id: nextId, title: newTask, completed: false };
    let addedTaskList = [...taskList, newTaskObj];
    setTaskList(addedTaskList);
    setNewTask(null);
    console.log("Added task");
  };

  const deleteTask = (id) => {
    let newTaskList = taskList.filter((task) => task.id !== id);
    setTaskList(newTaskList);
    console.log("Deleted task");
  };

  const toggleTask = (id) => {
    let newTaskList = taskList.map((task) => {
      if (task.id === id) {
        task.completed = !task.completed;
      }
      return task;
    });
    setTaskList(newTaskList);
    console.log("Toggled task");
  };

  return (
    <View className="flex-1 pt-12 px-6 bg-white">
      {/* Heading */}
      <Text className="text-lg">Todo List</Text>
      {/* ItemList */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {taskList.map((task) => {
            return (
              <View
                key={task.id}
                className="flex-row justify-between items-center"
              >
                <TouchableOpacity onPress={() => toggleTask(task.id)}>
                  <Task
                    id={task.id}
                    title={task.title}
                    completed={task.completed}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  className="items-center justify-center"
                  onPress={() => deleteTask(task.id)}
                >
                  <Text>del</Text>
                </TouchableOpacity>
              </View>
            );
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
