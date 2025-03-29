import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

const RecordingScreen = () => {
  //used to store recording object
  const [recording, setRecording] = useState(false);

  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    listRecordings();
  });

  const startRecording = async () => {
    try {
      // Request audio recording permissions
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        //allows recording and ensures recording continues even if the device is in silent mode.
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        //creates new recording instance
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        setRecording(recording);
        console.log("Recording started");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const stopRecording = async () => {
    try {
      //check if recording is happening
      if (!recording) {
        console.log("No active recording to stop.");
        return;
      }

      console.log("Stopping recording...");
      //stops recording and unloads it
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (!uri) {
        console.log("Failed to get recording URI.");
        return;
      }

      setRecording(null);
      console.log("Recording stopped");

      console.log("Recording stopped. Uploading...");
      await uploadAudioToFirebase(uri);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const uploadAudioToFirebase = async (uri) => {
    try {
      //get user data
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const uid = user.uid;

      const response = await fetch(uri);
      console.log(uri);
      const blob = await response.blob();

      const storageRef = ref(
        storage,
        `users/${uid}/recordings/audio-${Date.now()}.m4a`
      );
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      Alert.alert("Upload Successful", `Audio URL: ${downloadURL}`);

      return downloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Upload Failed", error.message);
    }
  };

  const listRecordings = async () => {
    try {
      //get user data
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const uid = user.uid;

      const listRef = ref(storage, `users/${uid}/recordings/`);
      const res = await listAll(listRef);
      const urls = await Promise.all(
        res.items.map((itemRef) => getDownloadURL(itemRef))
      );
      setRecordings(urls);
    } catch (error) {
      console.error("Error listing recordings:", error);
    }
  };

  const getRecordingLines = () => {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>Recording #{index + 1}</Text>
          <Button
            onPress={async () => {
              const soundObject = new Audio.Sound();
              try {
                console.log("playing sound");
                await soundObject.loadAsync({ uri: recordingLine });
                await soundObject.playAsync();
                soundObject.setOnPlaybackStatusUpdate((status) => {
                  if (status.didJustFinish) {
                    console.log("Sound has finished playing");
                  }
                });
              } catch (error) {
                console.error("Error playing sound:", error);
              }
            }}
            title="Play"
          ></Button>
        </View>
      );
    });
  };
  const clearRecordings = () => {
    setRecordings([]);
  };

  return (
    <View className="flex-1 pt-14">
      <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
        <Text>{recording ? "Stop Recording" : "StartRecording"}</Text>
        {getRecordingLines()}
      </TouchableOpacity>
      <TouchableOpacity onPress={clearRecordings}>
        <Text>Clear Recordings</Text>
      </TouchableOpacity>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginRight: 40,
  },
  fill: {
    flex: 1,
    margin: 15,
  },
});

export default RecordingScreen;
