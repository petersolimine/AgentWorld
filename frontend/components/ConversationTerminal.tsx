import React, { useEffect, useState, MouseEvent } from "react";
import styles from "./Terminal.module.css"; 

export interface Message {
  text: string;
  key: string | number;
  color: string;
}

function ConversationTerminal({ is_server }: { is_server: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: `${is_server ? "Server Actions:" : "Agent Responses:"}`,
      color: "red",
      key: 17283273,
    },
  ]);

  useEffect(() => {
    let ws: WebSocket;
    let retryTimeoutId: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_SERVER_URL || 'localhost:8080'}`);

      ws.addEventListener("open", () => {
        console.log(`Connected to WebSocket at ${process.env.NEXT_PUBLIC_SERVER_URL} || 'localhost:8080'`);
      });

      ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        retryTimeoutId = setTimeout(connect, 5000);
      });

      ws.addEventListener("message", (e) => {
        const data = JSON.parse(e.data);
        if (is_server === data.is_server) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: `${data.name}: ${data.message}`,
              color: data.color,
              key: prevMessages.length,
            },
          ]);
        }
      });
    };

    connect();

    return () => {
      clearTimeout(retryTimeoutId);
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.fakeMenu}>
        <div className={`${styles.fakeButtons} ${styles.fakeClose}`}></div>
        <div className={`${styles.fakeButtons} ${styles.fakeMinimize}`}></div>
        <div className={`${styles.fakeButtons} ${styles.fakeZoom}`}></div>
      </div>
      <div className={styles.fakeScreen}>
        <div className={styles.content}>
          {messages.map((message, index) => (
            <p
              key={message.key}
              className={`${styles["line"]}`}
              style={{ color: message.color }}
            >
              {message.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConversationTerminal;
