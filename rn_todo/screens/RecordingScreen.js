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
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

const RecordingScreen = ({ navigation }) => {
  //used to store recording object
  const [recordingQ, setRecordingQ] = useState(false);
  const [recordingsQ, setRecordingsQ] = useState([]);
  const [recordingA, setRecordingA] = useState(false);
  const [recordingsA, setRecordingsA] = useState([]);

  useEffect(() => {
    listRecordings();
  }, [recordingsQ, recordingsA]);

  const startRecording = async (qOrA) => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        console.log("Permission to record not granted");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      if (qOrA === "q") {
        setRecordingQ(recording);
      } else {
        setRecordingA(recording);
      }

      await recording.startAsync();
      console.log("Recording started");
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = async (qOrA) => {
    try {
      let recording;
      if (qOrA === "q") {
        recording = recordingQ;
        if (!recording) {
          console.log("No active recording to stop.");
          return;
        }
        setRecordingQ(null);
      } else {
        recording = recordingA;
        if (!recording) {
          console.log("No active recording to stop.");
          return;
        }
        setRecordingA(null);
      }

      console.log("Stopping recording...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        console.log("Failed to get recording URI.");
        return;
      }

      console.log("Recording stopped. Uploading...");
      await uploadAudioToFirebase(uri, qOrA);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const uploadAudioToFirebase = async (uri, qOrA) => {
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
        `users/${uid}/recordings/${qOrA}/audio-${Date.now()}.m4a`
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
      // Get user data
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const uid = user.uid;

      // Function to list and fetch download URLs
      const listAndFetchUrls = async (path) => {
        const listRef = ref(storage, `users/${uid}/recordings/${path}`);
        try {
          const res = await listAll(listRef);
          if (res.items.length > 0) {
            const urls = await Promise.all(
              res.items.map((itemRef) => getDownloadURL(itemRef))
            );
            return urls;
          }
          return []; // Return an empty array if no items are found
        } catch (error) {
          // If the folder/file doesn't exist, error.code might be "storage/object-not-found"
          if (error.code === "storage/object-not-found") {
            console.log(`No files found in path '${path}'.`);
            return [];
          }
          console.error(`Error listing files in path '${path}':`, error);
          return [];
        }
      };

      // Always list question recordings
      const urlsQ = await listAndFetchUrls("q");
      setRecordingsQ(urlsQ);

      // Always list answer recordings
      const urlsA = await listAndFetchUrls("a");
      setRecordingsA(urlsA);
    } catch (error) {
      console.error("Error listing recordings:", error);
    }
  };

  const getRecordingLines = (qOrA) => {
    let recordings;
    if (qOrA === "q") {
      recordings = recordingsQ;
    } else {
      recordings = recordingsA;
    }
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>#{index + 1}</Text>
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

  const clearRecordings = async () => {
    try {
      // Get user data
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const uid = user.uid;

      // Function to delete all files in a given path
      const deleteFilesInPath = async (path) => {
        const listRef = ref(storage, `users/${uid}/recordings/${path}`);
        const res = await listAll(listRef);
        await Promise.all(res.items.map((itemRef) => deleteObject(itemRef)));
      };

      // Delete question recordings
      await deleteFilesInPath("q");

      // Delete answer recordings
      await deleteFilesInPath("a");

      // Clear local state
      setRecordingsQ([]);
      setRecordingsA([]);

      // Provide feedback to the user
      Alert.alert("Success", "All recordings have been cleared.");
    } catch (error) {
      console.error("Error clearing recordings:", error);
      Alert.alert("Error", "Failed to clear recordings.");
    }
  };

  // Helper function to play a single sound and resolve when finished
  const playSoundSequentially = async (uri) => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync({ uri });
      return new Promise(async (resolve, reject) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            resolve();
          }
        });
        try {
          await sound.playAsync();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error loading sound:", error);
    }
  };

  // New function to play recordings in alternating order: q1 -> a1 -> q2 -> a2 -> ...
  const playAllRecordings = async () => {
    // Combine recordings from questions and answers
    const maxLength = Math.max(recordingsQ.length, recordingsA.length);
    let combinedRecordings = [];
    for (let i = 0; i < maxLength; i++) {
      if (i < recordingsQ.length) combinedRecordings.push(recordingsQ[i]);
      if (i < recordingsA.length) combinedRecordings.push(recordingsA[i]);
    }

    if (combinedRecordings.length === 0) {
      Alert.alert("No Recordings", "There are no recordings to play.");
      return;
    }

    // Play each recording sequentially
    for (const uri of combinedRecordings) {
      try {
        console.log("Playing:", uri);
        await playSoundSequentially(uri);
      } catch (error) {
        console.error("Error playing recording:", error);
      }
    }
    Alert.alert("Playback Finished", "All recordings have been played.");
  };

  return (
    <View className="flex-1 pt-14">
      {/* Navigation Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
        <Text className="text-blue-500">Go Back</Text>
      </TouchableOpacity>

      {/* New Play All Recordings Button */}
      <TouchableOpacity
        onPress={playAllRecordings}
        className="m-2 items-center p-1 bg-green-500 rounded-lg"
      >
        <Text className="text-white text-lg font-semibold">
          Play All Recordings
        </Text>
      </TouchableOpacity>

      {/* Recording Controls */}
      <View className="flex-row justify-between mb-4">
        {/* Question Recording */}
        <TouchableOpacity
          onPress={() =>
            recordingQ ? stopRecording("q") : startRecording("q")
          }
          className="flex-1 items-center p-4 bg-gray-200 rounded-lg mr-2"
        >
          <Text className="text-lg font-semibold" style={{ opacity: 0.3 }}>
            {recordingQ
              ? "Stop Recording Question"
              : "Start Recording Question"}
          </Text>
          {getRecordingLines("q")}
        </TouchableOpacity>

        {/* Answer Recording */}
        <TouchableOpacity
          onPress={() =>
            recordingA ? stopRecording("a") : startRecording("a")
          }
          className="flex-1 items-center p-4 bg-gray-200 rounded-lg ml-2"
        >
          <Text className="text-lg font-semibold">
            {recordingA ? "Stop Recording Answer" : "Start Recording Answer"}
          </Text>
          {getRecordingLines("a")}
        </TouchableOpacity>
      </View>

      {/* Clear Recordings Button */}
      <TouchableOpacity onPress={clearRecordings} className="items-center">
        <Text className="text-red-500">Clear Recordings</Text>
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
