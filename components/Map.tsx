import { View, Text } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import React from "react";
import { useLocationStore } from "@/store";
import { calculateRegion } from "@/lib/map";

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const region = calculateRegion();

  return (
    <View className="flex flex-1">
      <MapView
        provider={PROVIDER_DEFAULT}
        tintColor="black"
        className="rounded-lg w-full h-full"
        showsUserLocation
        showsPointsOfInterest
        userInterfaceStyle="light"
      >
        <View className="flex w-[90vw] h-full">
          <Text>Map</Text>
        </View>
      </MapView>
    </View>
  );
};

export default Map;
