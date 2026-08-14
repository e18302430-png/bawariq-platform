import { El_Messiri, Tajawal } from "next/font/google";

export const displayFont = El_Messiri({
  variable: "--font-display",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const bodyFont = Tajawal({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});
