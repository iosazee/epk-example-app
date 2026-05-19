import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { signIn, signUp } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

export default function SignInScreen() {
  const [mode, setMode] = useState<Mode>("sign-up");
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const r =
        mode === "sign-up"
          ? await signUp.email({ email, password, name: email })
          : await signIn.email({ email, password });
      if (r.error) {
        setError(r.error.message ?? r.error.code ?? "Unknown error");
        return;
      }
      router.replace("/(tabs)/passkey");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={styles.heading}>EPK Example</Text>
        <Text style={styles.subheading}>
          Demo for expo-passkey + expo-passkey-liveness
        </Text>

        <View style={styles.tabs}>
          <Tab label="Sign up" active={mode === "sign-up"} onPress={() => setMode("sign-up")} />
          <Tab label="Sign in" active={mode === "sign-in"} onPress={() => setMode("sign-in")} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.button, busy && styles.buttonBusy]} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{mode === "sign-up" ? "Create account" : "Sign in"}</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  heading: { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  subheading: { marginTop: 4, marginBottom: 32, fontSize: 14, color: "#64748b" },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 24 },
  tab: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: "#e2e8f0", alignItems: "center" },
  tabActive: { backgroundColor: "#0f172a" },
  tabText: { color: "#475569", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  input: {
    backgroundColor: "#fff",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { color: "#dc2626", marginBottom: 12, fontSize: 14 },
  button: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },
  buttonBusy: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
