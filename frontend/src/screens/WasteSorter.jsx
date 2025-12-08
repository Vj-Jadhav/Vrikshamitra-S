import React from "react";
import { View, Platform } from "react-native";
import { WebView } from "react-native-webview";

export default function OceanGameScreen() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={["*"]}

        source={
          Platform.OS === "android"
            ? { uri: "file:///android_asset/WasteSorter/index.html" }
            : require("../assets/WasteSorter/index.html")
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
