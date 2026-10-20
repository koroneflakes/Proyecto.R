import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type TextInputProps,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSignIn, useSignUp } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import { VideoView, useVideoPlayer } from "expo-video";

import { images } from "@/constants/images";

type AuthMode = "sign-up" | "sign-in";
type SocialProvider = "Google" | "Facebook";

const CLERK_ERROR_MESSAGES: Record<string, string> = {
  form_code_expired: "El código venció. Solicita uno nuevo.",
  form_code_incorrect: "El código no es válido. Inténtalo de nuevo.",
  form_identifier_exists: "Ya existe una cuenta con este correo.",
  form_identifier_not_found: "No encontramos una cuenta con este correo.",
  form_password_incorrect: "La contraseña no es correcta.",
  form_password_pwned: "Elige una contraseña diferente para proteger tu cuenta.",
  too_many_requests: "Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.",
};

function getClerkErrorMessage(error: { code: string } | null) {
  if (!error) return null;

  return (
    CLERK_ERROR_MESSAGES[error.code] ??
    "No se pudo completar la solicitud. Revisa tus datos e inténtalo de nuevo."
  );
}

function getConnectionErrorMessage() {
  return "No fue posible conectar con el servicio de autenticación. Comprueba tu conexión e inténtalo de nuevo.";
}

function getCaughtAuthErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return (
      CLERK_ERROR_MESSAGES[error.code] ??
      "No se pudo completar la solicitud. Inténtalo de nuevo."
    );
  }

  return getConnectionErrorMessage();
}

type AuthFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  inputProps?: TextInputProps;
  accessory?: ReactNode;
};

function AuthField({
  label,
  placeholder,
  value,
  onChangeText,
  inputProps,
  accessory,
}: AuthFieldProps) {
  return (
    <View className="h-[54px] w-full flex-row items-center rounded-[13px] border border-[#e8e8e8] px-3">
      <View className="flex-1">
        <Text className="text-[10px] leading-[13px] text-[#85858b]">
          {label}
        </Text>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          className="h-[21px] p-0 text-[13px] leading-[18px] text-[#25252b]"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a3a3a8"
          value={value}
          {...inputProps}
        />
      </View>
      {accessory}
    </View>
  );
}

function SocialButton({
  provider,
  disabled,
  onPress,
}: {
  provider: SocialProvider;
  disabled: boolean;
  onPress: () => void;
}) {
  const isGoogle = provider === "Google";

  return (
    <Pressable
      accessibilityRole="button"
      className="h-[50px] w-full flex-row items-center justify-center rounded-[13px] border border-[#e8e8e8]"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      <Text
        accessible={false}
        className={`absolute left-4 text-[20px] font-extrabold ${
          isGoogle ? "text-[#c94b4b]" : "text-[#2875c7]"
        }`}
      >
        {isGoogle ? "G" : "f"}
      </Text>
      <Text className="text-[13px] font-medium text-[#24242a]">
        Continuar con {provider}
      </Text>
    </Pressable>
  );
}

function VerificationModal({
  visible,
  email,
  busy,
  error,
  onClose,
  onVerify,
}: {
  visible: boolean;
  email: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
}) {
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    if (visible && !busy && error) inputRef.current?.focus();
  }, [busy, error, visible]);

  const close = () => {
    setCode("");
    onClose();
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);

    if (digits.length !== 6 || isVerifyingRef.current) return;

    isVerifyingRef.current = true;
    Keyboard.dismiss();
    void onVerify(digits)
      .then((verified) => {
        if (!verified) {
          setCode("");
          inputRef.current?.focus();
        }
      })
      .finally(() => {
        isVerifyingRef.current = false;
      });
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center bg-black/45 px-6">
          <View
            className="w-full self-center rounded-[24px] bg-white px-6 pb-7 pt-6"
            style={{ maxWidth: 420 }}
          >
            <Pressable
              accessibilityLabel="Cerrar verificación"
              accessibilityRole="button"
              className="absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full bg-[#f5f4f7]"
              onPress={close}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-[22px] leading-[24px] text-[#5c5b63]">
                ×
              </Text>
            </Pressable>

            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#f1eaff]">
              <Text className="text-[23px] text-[#6e40ed]">✉</Text>
            </View>
            <Text className="mb-2 text-[22px] font-bold text-[#182333]">
              Verifica tu correo
            </Text>
            <Text className="mb-6 text-[14px] leading-[21px] text-[#71717a]">
              Te enviamos un correo
              {email ? ` a ${email}` : ""}. Ingresa el código de verificación
              de 6 dígitos.
            </Text>

            <Pressable
              accessibilityRole="button"
              className="mb-3 flex-row justify-between"
              onPress={() => inputRef.current?.focus()}
            >
              {Array.from({ length: 6 }, (_, index) => (
                <View
                  key={index}
                  className={`h-[54px] w-[13.5%] items-center justify-center rounded-[12px] border ${
                    code[index] ? "border-[#6e40ed]" : "border-[#e4e2e8]"
                  }`}
                >
                  <Text className="text-[20px] font-semibold text-[#20202a]">
                    {code[index] ?? ""}
                  </Text>
                </View>
              ))}
            </Pressable>
            <TextInput
              accessibilityLabel="Código de verificación de 6 dígitos"
              autoComplete="one-time-code"
              autoFocus
              caretHidden
              editable={!busy}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={handleCodeChange}
              ref={inputRef}
              textContentType="oneTimeCode"
              value={code}
              style={{
                height: 1,
                opacity: 0,
                position: "absolute",
                width: 1,
              }}
            />
            {error ? (
              <Text
                accessibilityLiveRegion="polite"
                className="mb-2 text-center text-[12px] text-[#b42318]"
                selectable
              >
                {error}
              </Text>
            ) : null}
            <Text className="text-center text-[12px] text-[#86858d]">
              {busy
                ? "Verificando código..."
                : "El código se verificará automáticamente."}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const isSignUp = mode === "sign-up";
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const player = useVideoPlayer(images.registrationAnimation, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  const startVerification = async () => {
    const emailAddress = email.trim();
    setAuthError(null);

    if (!emailAddress) {
      setAuthError("Escribe tu correo electrónico para continuar.");
      return;
    }

    if (isSignUp && !password) {
      setAuthError("Escribe una contraseña para crear tu cuenta.");
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();
    try {
      if (isSignUp) {
        const { error } = await signUp.password({ emailAddress, password });
        if (error) {
          setAuthError(getClerkErrorMessage(error));
          return;
        }

        const { error: verificationError } =
          await signUp.verifications.sendEmailCode();
        if (verificationError) {
          setAuthError(getClerkErrorMessage(verificationError));
          return;
        }
      } else {
        const { error } = await signIn.emailCode.sendCode({ emailAddress });
        if (error) {
          setAuthError(getClerkErrorMessage(error));
          return;
        }
      }

      setVerificationVisible(true);
    } catch (error) {
      setAuthError(getCaughtAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (code: string) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const { error } = isSignUp
        ? await signUp.verifications.verifyEmailCode({ code })
        : await signIn.emailCode.verifyCode({ code });

      if (error) {
        setAuthError(getClerkErrorMessage(error));
        return false;
      }

      const status = isSignUp ? signUp.status : signIn.status;
      if (status !== "complete") {
        setAuthError("No se pudo completar la verificación. Inténtalo de nuevo.");
        return false;
      }

      const { error: finalizeError } = isSignUp
        ? await signUp.finalize()
        : await signIn.finalize();
      if (finalizeError) {
        setAuthError(getClerkErrorMessage(finalizeError));
        return false;
      }

      setVerificationVisible(false);
      Keyboard.dismiss();
      router.replace("/(tabs)");
      return true;
    } catch (error) {
      setAuthError(getCaughtAuthErrorMessage(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithSocialProvider = async (provider: SocialProvider) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const strategy =
        provider === "Google" ? "oauth_google" : "oauth_facebook";
      const { createdSessionId, authSessionResult, signUp: pendingSignUp } =
        await startSSOFlow({ strategy });

      if (createdSessionId) {
        router.replace("/sso-callback");
        return;
      }

      if (pendingSignUp?.status === "missing_requirements") {
        setAuthError(
          "La cuenta requiere información adicional. Contacta con soporte para continuar."
        );
        return;
      }

      if (
        authSessionResult?.type !== "cancel" &&
        authSessionResult?.type !== "dismiss"
      ) {
        setAuthError(`No se pudo iniciar sesión con ${provider}. Inténtalo de nuevo.`);
      }
    } catch (error) {
      setAuthError(getCaughtAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const videoWidth = Math.min(width - 48, 240);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
          paddingBottom: 24,
          paddingHorizontal: 24,
          paddingTop: 30,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full" style={{ maxWidth: 430 }}>
          <Text
            accessibilityRole="header"
            className="text-center text-[25px] font-extrabold leading-[32px] text-[#172338]"
          >
            {isSignUp ? "Crea tu cuenta" : "Inicia sesión"}
          </Text>

          <View className="mb-3 mt-2 items-center">
            <VideoView
              contentFit="contain"
              nativeControls={false}
              playsInline
              player={player}
              style={{ height: 190, width: videoWidth }}
            />
          </View>

          <View className="gap-3">
            <AuthField
              inputProps={{
                autoComplete: "email",
                keyboardType: "email-address",
                returnKeyType: isSignUp ? "next" : "done",
                textContentType: "emailAddress",
              }}
              label="Correo electrónico"
              onChangeText={setEmail}
              placeholder="artisan@example.com"
              value={email}
            />

            {isSignUp ? (
              <AuthField
                accessory={
                  <Pressable
                    accessibilityLabel={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    accessibilityRole="button"
                    className="ml-2 h-9 w-9 items-center justify-center"
                    onPress={() => setShowPassword((visible) => !visible)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text className="text-[16px] text-[#8b8b91]">
                      {showPassword ? "◉" : "◎"}
                    </Text>
                  </Pressable>
                }
                inputProps={{
                  autoComplete: "new-password",
                  returnKeyType: "done",
                  secureTextEntry: !showPassword,
                  textContentType: "newPassword",
                }}
                label="Contraseña"
                onChangeText={setPassword}
                placeholder="••••••••"
                value={password}
              />
            ) : null}

            {authError ? (
              <Text
                accessibilityLiveRegion="polite"
                className="text-[12px] leading-[18px] text-[#b42318]"
                selectable
              >
                {authError}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className="h-[52px] w-full items-center justify-center rounded-[12px] bg-ocre"
              disabled={isSubmitting}
              onPress={() => void startVerification()}
              style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}
            >
              <Text className="text-[14px] font-semibold text-white">
                {isSubmitting
                  ? isSignUp
                    ? "Creando cuenta..."
                    : "Enviando código..."
                  : isSignUp
                    ? "Crear cuenta"
                    : "Iniciar sesión"}
              </Text>
            </Pressable>
          </View>

          <View className="my-4 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-[#ecebef]" />
            <Text className="text-[13px] text-[#88878f]">
              o continúa con
            </Text>
            <View className="h-px flex-1 bg-[#ecebef]" />
          </View>

          <View className="gap-2">
            <SocialButton
              disabled={isSubmitting}
              onPress={() => void signInWithSocialProvider("Google")}
              provider="Google"
            />
            <SocialButton
              disabled={isSubmitting}
              onPress={() => void signInWithSocialProvider("Facebook")}
              provider="Facebook"
            />
          </View>

          <View className="mt-4 flex-row items-center justify-center">
            <Text className="text-[12px] text-[#85848c]">
              {isSignUp
                ? "¿Ya tienes una cuenta? "
                : "¿Aún no tienes una cuenta? "}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push(isSignUp ? "/sign-in" : "/sign-up")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-[12px] font-semibold text-[#6238d3]">
                {isSignUp ? "Inicia sesión" : "Crea tu cuenta"}
              </Text>
            </Pressable>
          </View>

          {isSignUp ? <View nativeID="clerk-captcha" /> : null}
        </View>
      </ScrollView>

      <VerificationModal
        busy={isSubmitting}
        error={authError}
        email={email}
        onClose={() => setVerificationVisible(false)}
        onVerify={verifyCode}
        visible={verificationVisible}
      />
    </View>
  );
}
