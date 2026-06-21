// Dynamic Expo config — adds a side-by-side "development" variant so the dev
// build (CigTracker Dev · com.cigtracker.rn.dev) installs ALONGSIDE the
// production build instead of overwriting it. Everything else is inherited from
// app.json unchanged (plugins, EAS projectId, slug, icons, owner, scheme…).
//
// The variant is selected by the APP_VARIANT env var, set per profile in
// eas.json. Running `expo start` locally doesn't need it — the native identity
// is baked in at build time.
const IS_DEV = process.env.APP_VARIANT === "development";

module.exports = ({ config }) => ({
  ...config,
  name: IS_DEV ? "CigTracker Dev" : config.name,
  ios: {
    ...config.ios,
    bundleIdentifier: IS_DEV ? "com.cigtracker.rn.dev" : config.ios.bundleIdentifier,
  },
  android: {
    ...config.android,
    package: IS_DEV ? "com.cigtracker.rn.dev" : config.android.package,
  },
});
