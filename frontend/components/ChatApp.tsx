import { useEffect, useState, MouseEvent } from "react";
import { Message } from "./interfaces";
// this should only be localhost for now, but can change to a domain name later
const network_url =
  process.env.NODE_ENV === "production" ? "localhost" : "world";

function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ws: WebSocket;
    let retryTimeoutId: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(`ws://${network_url}:8080`);

      ws.addEventListener("open", () => {
        console.log("Connected to WebSocket");
      });

      ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        retryTimeoutId = setTimeout(connect, 5000); // retry after 5 seconds if connection fails
      });

      ws.addEventListener("message", (e) => {
        const data = JSON.parse(e.data);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `${data.name}: ${data.message}`,
            color: data.color,
            key: prevMessages.length,
          },
        ]);
      });
    };

    connect();

    return () => {
      clearTimeout(retryTimeoutId); // clear retry timeout on component unmount
      if (ws) ws.close();
    };
  }, []);

  const loadMore = (event: MouseEvent) => {
    event.preventDefault();
    setPage(page + 1);
  };

  const displayedMessages = messages.slice(-page * 20);

  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg p-6 max-w-lg mx-auto mt-10 sm:max-w-3xl sm:mt-16 h-[50vh] overflow-y-auto">
      {page * 20 < messages.length && (
        <button
          className="text-blue-500 font-semibold hover:text-blue-700"
          onClick={loadMore}
        >
          Load more messages...
        </button>
      )}
      <div className="flex flex-col space-y-4">
        {displayedMessages.map((message) => (
          <div
            key={message.key}
            className="rounded-lg py-2 px-4 max-w-md w-full inline-block"
            style={{
              backgroundColor: message.color,
              color: "black",
            }}
          >
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatApp;
