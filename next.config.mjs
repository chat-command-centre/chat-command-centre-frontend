/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    experimental: {
        optimizeFonts: true,
        optimizeImages: true,
        optimizeCss: true,
        scrollRestoration: true,
    },
};

export default config;