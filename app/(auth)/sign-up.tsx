import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useState } from "react";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import { ReactNativeModal } from "react-native-modal";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { isLoaded, signUp, setActive } = useSignUp();

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      console.log(form);
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (signUpAttempt.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: signUpAttempt.createdUserId,
          }),
        });

        await setActive({ session: signUpAttempt.createdSessionId });
        setVerification({ ...verification, state: "success" });
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setVerification({
          ...verification,
          state: "failed",
          error: "Verification failed",
        });
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setVerification({
        ...verification,
        state: "failed",
        error: err.errors[0].longMessage,
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.signUpCar}
            className="z-0 w-full h-[250px]"
          />

          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value: string) => setForm({ ...form, name: value })}
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            icon={icons.lock}
            value={form.password}
            onChangeText={(value: string) =>
              setForm({ ...form, password: value })
            }
          />

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          <OAuth />

          <Link
            href={"/(auth)/sign-in"}
            className="text-lg text-center text-general-200 mt-10"
          >
            <Text>Already have an account? </Text>

            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") setShowSuccessModal(true);
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              Verification
            </Text>

            <Text className="text-base text-gray-400 font-Jakarta text-center mb-5">
              We have sent a verification code to {form.email}
            </Text>

            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />

            {verification.error && (
              <Text className="text-sm text-red-500 font-Jakarta mt-1">
                {verification.error}
              </Text>
            )}

            <CustomButton
              title="Verify Email"
              className="mt-5"
              onPress={onVerifyPress}
            />
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />

            <Text className="text-3xl font-JakartaBold text-center">
              Verified.
            </Text>

            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>

            <CustomButton
              title="Browse Home"
              className="mt-5"
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/(root)/(tabs)/home");
              }}
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
