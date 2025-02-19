import { View, Text, ImageSourcePropType } from "react-native";
import React from "react";
import { GoogleInputProps } from "@/types/type";

const GoogleTextInput = ({
  icon,
  initialLocation,
  textInputBackgroundColor,
  containerStyle,
  handlePress,
}: GoogleInputProps) => {
  return (
    <View
      className={`flex flex-row items-center justify-center relative z-20 rounedd-xl ${containerStyle} mb-5`}
    >
      <Text>GoogleTextInput</Text>
    </View>
  );
};

export default GoogleTextInput;
