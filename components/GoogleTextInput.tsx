import { View, Image } from "react-native";
import React, { useRef } from "react";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { GoogleInputProps } from "@/types/type";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  textInputBackgroundColor,
  containerStyle,
  handlePress,
}: GoogleInputProps) => {
  const ref = useRef<GooglePlacesAutocompleteRef>(null);
  const { userLatitude, userLongitude } = useLocationStore();

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-20 rounded-xl ${containerStyle} mb-5`}
    >
      <GooglePlacesAutocomplete
        ref={ref}
        enablePoweredByContainer={false}
        numberOfLines={2}
        fetchDetails
        placeholder="Where do you want to go?"
        debounce={200}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY!,
          language: "en",
          location: `${userLatitude},${userLongitude}`,
          radius: Boolean(userLatitude && userLongitude) ? 20000 : undefined,
          strictbounds: Boolean(userLatitude && userLongitude),
        }}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            marginHorizontal: 20,
            position: "relative",
            shadowColor: "#d4d4d4",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor || "white",
            fontSize: 16,
            fontWeight: 600,
            marginTop: 5,
            width: "100%",
            borderRadius: 20,
          },
          listView: {
            backgroundColor: textInputBackgroundColor || "white",
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            shadowColor: "#d4d4d4",
            zIndex: 100,
          },
          row: {
            backgroundColor: "transparent",
          },
        }}
        onPress={(data, details = null) => {
          handlePress({
            latitude: details?.geometry.location.lat!,
            longitude: details?.geometry.location.lng!,
            address: data.description,
          });
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            <Image
              source={icon ? icon : icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
          placeholder: initialLocation ?? "Where do you want to go?",
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
