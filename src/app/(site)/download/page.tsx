import type { Metadata } from "next";
import DownloadClient from "./DownloadClient";

export const metadata: Metadata = {
  title: "Download the Android App | PharmaWallah",
  description:
    "Get 89 pharmacy calculators on your phone. Works completely offline — no internet needed after install.",
};

export default function DownloadPage() {
  return <DownloadClient />;
}
