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

const RecordingScreen = () => {
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
      if (!recording) {
        console.log("No active recording to stop.");
        return;
      }

      console.log("Stopping recording...");
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (!uri) {
        console.log("Failed to get recording URI.");
        return;
      }

      const { sound, status } = await recording.createNewLoadedSoundAsync();

      const newRecording = {
        sound: sound,
        duration: getDurationFormatted(status.durationMillis),
        file: uri,
      };

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
      const response = await fetch(uri);
      console.log(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `recordings/audio-${Date.now()}.m4a`);
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
      const listRef = ref(storage, "recordings/");
      const res = await listAll(listRef);
      const urls = await Promise.all(
        res.items.map((itemRef) => getDownloadURL(itemRef))
      );
      setRecordings(urls);
    } catch (error) {
      console.error("Error listing recordings:", error);
    }
  };

  const getDurationFormatted = (milliseconds) => {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
    return seconds < 10
      ? `${Math.floor(minutes)}:0${seconds}`
      : `${Math.floor(minutes)}:${seconds}`;
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
                await soundObject.loadAsync({ uri: recordingLine });
                await soundObject.playAsync();
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
    <View>
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
