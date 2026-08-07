import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  experimental: {
    // Every page here is dynamic (auth depends on cookies()), so without
    // this, Next.js neither prefetches nor caches them client-side —
    // every navigation is a full server round trip. 30s matches Next's
    // own pre-v15 default and is safe here since every mutation flow
    // already calls router.refresh() / does a hard redirect on success.
    staleTimes: {
      dynamic: 30,
    },
  },
=======
  /* config options here */
>>>>>>> 59688ca (Initial commit from Create Next App)
};

export default nextConfig;
