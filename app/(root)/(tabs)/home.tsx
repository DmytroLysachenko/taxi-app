import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useLocationStore } from "@/store";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";

export default function Page() {
  const { user } = useUser();
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const [hasPermission, setHasPermission] = useState(false);
  const { signOut } = useAuth();
  const {
    data: recentRides,
    loading,
  }: { data: Ride[] | null; loading: boolean } = useFetch(
    `/(api)/ride/${user?.id}`
  );

  const handleSignOut = () => {
    signOut();

    router.replace("/(auth)/sign-in");
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);

    router.push("/(root)/find-ride");
  };

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setHasPermission(false);
        return;
      } else {
        setHasPermission(true);
      }

      const location = await Location.getCurrentPositionAsync();

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
        address: `${address[0].street} ${address[0].streetNumber}, ${address[0].city}`,
      });
    };

    requestLocation();
  }, []);

  return (
    <SafeAreaView>
      <FlatList
        data={recentRides ? recentRides.slice(0, 5) : []}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator
                size="small"
                color="#000"
                className="mt-[45vh]"
              />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <View className="flex flex-col">
                <Text
                  className=" text-2xl font-JakartaBold"
                  numberOfLines={1}
                >
                  Welcome,{" "}
                  {user?.firstName ||
                    user?.emailAddresses[0].emailAddress.split("@")[0]}{" "}
                  👋
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image
                  source={icons.out}
                  className="w-4 h-4"
                />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              textInputBackgroundColor="white"
              handlePress={handleDestinationPress}
            />

            {hasPermission && (
              <>
                <Text className="text-xl font-JakartaBold mt-5 mb-3">
                  Your Current Location
                </Text>

                <View className="flex flex-row items-center bg-transparent h-[300px]">
                  <Map />
                </View>
              </>
            )}

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        )}
      />
    </SafeAreaView>
  );
}
