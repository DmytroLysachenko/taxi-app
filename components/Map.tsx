import { View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import React, { useEffect, useState } from "react";
import { useDriverStore, useLocationStore } from "@/store";
import { calculateRegion, generateMarkersFromData } from "@/lib/map";
import { MarkerData } from "@/types/type";
import { icons } from "@/constants";

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, []);

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      tintColor="black"
      className="rounded-lg w-full h-full"
      showsUserLocation
      showsPointsOfInterest
      userInterfaceStyle="light"
    >
      <View className="flex w-[90vw] h-full">
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            image={
              selectedDriver === marker.id ? icons.selectedMarker : icons.marker
            }
          />
        ))}
      </View>
    </MapView>
  );
};

export default Map;
