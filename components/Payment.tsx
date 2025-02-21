import { Alert } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import { useStripe } from "@stripe/stripe-react-native";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [success, setSuccess] = useState(false);

  // const key = await fetchKey();
  useEffect(() => {
    // fetchPublishableKey();
  }, []);

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: { amount: 1090, currencyCode: "USD" },
        confirmHandler,
      },
    });

    if (error) {
      Alert.alert(`Error code: ${error.code}`);
    }
  };

  const confirmHandler = async (paymentMethod, _, intentCreationCallback) => {
    const { paymentIntent, customer } = await fetchAPI(
      "/(api)/(stripe)/create",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          name: fullName || email.split("@")[0],
          email,
          amount,
          paymentMethodId: paymentMethod.id,
        }),
      }
    );

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

      if (result.client_secret) {
        // ride/create
      }
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
    </>
  );
};

export default Payment;
