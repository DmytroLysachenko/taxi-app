import { Alert, Image, Text, View } from "react-native";
import React, { useState } from "react";
import CustomButton from "./CustomButton";
import { useStripe } from "@stripe/stripe-react-native";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import { IntentCreationCallbackParams } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet";
import { Result } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentMethod";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constants";
import { router } from "expo-router";
import * as Linking from "expo-linking";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { userId } = useAuth();

  const {
    userAddress,
    userLatitude,
    userLongitude,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const [success, setSuccess] = useState(false);

  const confirmHandler = async (
    paymentMethod: Result,
    _: boolean,
    intentCreationCallback: (result: IntentCreationCallbackParams) => void
  ) => {
    console.log("paymentMethod", paymentMethod);

    const { paymentIntent, customer } = await fetchAPI(
      "/(api)/(stripe)/create",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          name: fullName || email.split("@")[0],
          email,
          amount,
        }),
      }
    );

    console.log("created payment intent", paymentIntent);

    if (paymentIntent.client_secret) {
      const { result } = await fetchAPI("/(api)/(stripe)/pay", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          payment_intent_id: paymentIntent.id,
          customer_id: customer,
        }),
      });
      console.log("created payment", result);

      if (result.client_secret) {
        const ride = await fetchAPI("/(api)/ride/create", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            origin_address: userAddress,
            destination_address: destinationAddress,
            origin_latitude: userLatitude,
            origin_longitude: userLongitude,
            destination_latitude: destinationLatitude,
            destination_longitude: destinationLongitude,
            ride_time: rideTime.toFixed(0),
            fare_price: parseInt(amount) * 100,
            payment_status: "paid",
            driver_id: driverId,
            user_id: userId,
          }),
        });

        console.log("created ride", ride);

        intentCreationCallback({
          clientSecret: result.client_secret,
        });
      }
    }
  };

  const initializePaymentSheet = async () => {
    const returnURL = Linking.createURL("/(root)/book-ride");
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: { amount: parseInt(amount) * 100, currencyCode: "USD" },
        confirmHandler,
      },
      returnURL: "taxi-app://book-ride",
    });

    if (error) {
      Alert.alert(`Error code: ${error.code}`);
    }
  };

  const openPaymentsSheet = async () => {
    await initializePaymentSheet();

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`);
    } else {
      setSuccess(true);
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-5"
        onPress={openPaymentsSheet}
      />
      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image
            source={images.check}
            className="w-28 h-28 mt-5"
          />

          <Text className="text-2xl font-JakartaBold text-center mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md font-JakartaMedium text-center text-general-200 mt-3">
            Thank you for your booking. Your reservation has been confirmed.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
