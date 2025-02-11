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
import React, { useEffect, useState } from "react";
import Task from "../components/Task";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const HomeScreen = ({ navigation }) => {
  const [taskList, setTaskList] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const q = query(collection(db, "todos"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todos = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      setTaskList(todos);
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (newTask) => {
    Keyboard.dismiss();
    try {
      const docRef = await addDoc(collection(db, "todos"), {
        title: newTask,
        completed: false,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    console.log("Added task");
  };

  const deleteTask = async (id) => {
    const todo = await deleteDoc(doc(db, "todos", id));
    console.log("Deleted task");
  };

  const toggleTask = async (id) => {
    const todoRef = doc(db, "todos", id);
    const todoSnap = await getDoc(todoRef);
    if (todoSnap.exists()) {
      const todoData = todoSnap.data();
      await setDoc(
        todoRef,
        { completed: !todoData.completed },
        { merge: true }
      );
      console.log("Toggled task");
    } else {
      console.log("No such document!");
    }
    console.log("Toggled task");
  };

  return (
    <View className="flex-1 pt-12 px-6 bg-white">
      {/* Heading */}
      <Text className="text-lg">Todo List</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Flashcard")}>
        <Text>FlashCard</Text>
      </TouchableOpacity>
      /* ItemList */
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ height: "80%" }}
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
};

export default HomeScreen;
