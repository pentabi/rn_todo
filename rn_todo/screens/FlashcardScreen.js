import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import React, { useState } from "react";
import { Audio } from "expo-av";

const FlashcardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text>Back</Text>
      </TouchableOpacity>
      <Text>Flashcard Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FlashcardScreen;
