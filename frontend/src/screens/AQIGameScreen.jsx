import React from "react";
import { View, Platform } from "react-native";
import { WebView } from "react-native-webview";

export default function AQIGameScreen() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={["*"]}

        source={
          Platform.OS === "android"
            ? { uri: "file:///android_asset/AQIGame/home.html" }
            : require("../assets/AQIGame/home.html")
        }

        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowingReadAccessToURL={"file:///"}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        style={{ flex: 1 }}
      />
    </View>
  );
}
