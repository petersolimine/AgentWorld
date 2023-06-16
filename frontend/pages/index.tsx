import Image from "next/image";
import { Inter } from "next/font/google";
import ChatApp from "../components/ChatApp";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return <ChatApp />;
}
