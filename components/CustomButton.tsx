import { Text, TouchableOpacity } from "react-native";
import React from "react";

const CustomButton = ({ onPress, title, bgVariant = "primary" }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>CustomButton</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
