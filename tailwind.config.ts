import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { brand: { ocean: "#C3C7F4", deep: "#231942", darkOcean: "#483868", mint: "#C8A8E9", paleMint: "#F4E7FB", champagne: "#F2DDDC", coral: "#F6BCBA", peach: "#E3AADD", lavenderMist: "#F4E7FB", blushCream: "#F2DDDC", coralDeep: "#F59D9B", roseLilac: "#E3AADD", lavenderPurple: "#C8A8E9", periwinkle: "#C3C7F4", indigoMuted: "#635085", pillDark: "#483C6C" } } } }, plugins: [] };
export default config;
