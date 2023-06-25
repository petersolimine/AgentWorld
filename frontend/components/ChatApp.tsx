import { useEffect, useState, MouseEvent } from "react";
import { Message } from "./interfaces";

function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ws: WebSocket;
    let retryTimeoutId: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket("ws://localhost:8080");

      ws.addEventListener("open", () => {
        console.log("Connected to WebSocket");
      });

      ws.addEventListener("error", () => {
        console.log("WebSocket connection error. Retrying in 5 seconds...");
        retryTimeoutId = setTimeout(connect, 5000); // retry after 5 seconds if connection fails
      });

      ws.addEventListener("message", (e) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: e.data, key: prevMessages.length },
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
        {displayedMessages.map((message, idx) => (
          <div
            key={message.key}
            className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-md w-full inline-block"
          >
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatApp;
