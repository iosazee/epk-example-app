/** @type {import('next').NextConfig} */
const nextConfig = {
  // expo-passkey and expo-passkey-liveness pull React Native types in
  // some entry points. Transpiling them through Next.js keeps the
  // server bundle build happy. The /web entry points are pure JS
  // and don't touch any RN code at runtime.
  transpilePackages: ["expo-passkey", "expo-passkey-liveness"],
  webpack: (config) => {
    // expo-modules-core is RN-only; alias to false on web so any
    // accidental import resolves to a no-op rather than failing.
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "expo-modules-core": false,
      "react-native": false,
      "expo-local-authentication": false,
    };
    return config;
  },
};

export default nextConfig;
