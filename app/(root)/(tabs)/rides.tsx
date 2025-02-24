import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Ride } from "@/types/type";
import { useFetch } from "@/lib/fetch";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-react";

const Rides = () => {
  const { user } = useUser();

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

  return (
    <SafeAreaView>
      <FlatList
        data={recentRides ?? []}
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

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              All Rides
            </Text>
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default Rides;
