import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { AppProps } from "next/app";
import { Norican, Roboto_Flex } from "next/font/google";

const norican = Norican({
  weight: "400",
  variable: "--font-norican",
  display: "swap",
  subsets: ["latin"],
});
const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  display: "swap",
  subsets: ["latin"],
  fallback: ["sans-serif"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${norican.variable} ${robotoFlex.variable} h-full font-sans`}
    >
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
