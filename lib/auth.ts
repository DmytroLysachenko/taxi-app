import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { TokenCache } from "@clerk/clerk-expo/dist/cache";
import { fetchAPI } from "./fetch";
import * as AuthSession from "expo-auth-session";
import { StartSSOFlowParams, StartSSOFlowReturnType } from "@clerk/clerk-expo";

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`${key} was used 🔐 \n`);
        } else {
          console.log("No values stored under key: " + key);
        }
        return item;
      } catch (error) {
        console.error("secure store get item error: ", error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: (key: string, token: string) => {
      return SecureStore.setItemAsync(key, token);
    },
  };
};

export const googleOAuth = async (
  startSSOFlow: (
    startSSOFlowParams: StartSSOFlowParams
  ) => Promise<StartSSOFlowReturnType>
) => {
  try {
    const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
      strategy: "oauth_google",
      redirectUrl: AuthSession.makeRedirectUri({
        scheme: "myapp",
        path: "/(root)/(tabs)/home",
      }),
    });

    if (createdSessionId) {
      if (setActive) {
        setActive!({ session: createdSessionId });

        if (signUp?.createdUserId) {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
        }

        return {
          success: true,
          code: "success",
          message: "Successfully signed up with google",
        };
      }
    }

    return {
      success: false,
      message: "Error during OAuth login, try again please.",
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: err?.errors[0]?.longMessage,
    };
  }
};

// SecureStore is not supported on the web
export const tokenCache =
  Platform.OS !== "web" ? createTokenCache() : undefined;
