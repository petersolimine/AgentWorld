import React, { useEffect, useState, MouseEvent } from "react";
import styles from "./Terminal.module.css"; // Assuming you're using CSS Modules and styles are defined in Terminal.module.css

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
  const [page, setPage] = useState(1);

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
        // if is_server is true, then we only want to display messages from the server. If not, only display messages from the players.
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

  const loadMore = (event: MouseEvent) => {
    event.preventDefault();
    setPage(page + 1);
  };

  const displayedMessages = messages.slice(-page * 20);

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.fakeMenu}>
        <div className={`${styles.fakeButtons} ${styles.fakeClose}`}></div>
        <div className={`${styles.fakeButtons} ${styles.fakeMinimize}`}></div>
        <div className={`${styles.fakeButtons} ${styles.fakeZoom}`}></div>
      </div>
      <div className={styles.fakeScreen}>
        <div className={styles.content}>
          {page * 20 < messages.length && (
            <button className={styles.loadMoreButton} onClick={loadMore}>
              Load more messages...
            </button>
          )}
          {displayedMessages.map((message, index) => (
            <p
              key={message.key}
              className={`${styles["line"]}`}
              style={{ color: message.color }}
            >
              {message.text}
              <span
                className={styles.cursor}
              >
                _
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConversationTerminal;
