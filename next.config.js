const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  env: {ISN_DOMAIN: process.env.ISN_DOMAIN,ISN_COMPANY_KEY: process.env.ISN_COMPANY_KEY,AIRCALL_API_ID: process.env.AIRCALL_API_ID,AIRCALL_API_TOKEN: process.env.AIBCAOL_API_TOKEN,WHATCONVERTS_API_KEY: process.env.WHATCONVERTS_API_KEY,WHATCONVERTS_SECRET: process.env.WHATCONVERTS_SECRET,ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL}
};

module.exports = nextConfig;