import Image from "next/image";
import { Inter } from "next/font/google";
import ChatApp from "@/components/ChatApp";
import ConversationTerminal from "@/components/ConversationTerminal";
import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className={styles.terminalWrapper}>
      <ConversationTerminal is_server={false} />
      <ConversationTerminal is_server={true} />
    </div>
  );
}
