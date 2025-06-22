import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://vk-backend-7kcd.onrender.com"); // Подключение к серверу Render

export default function App() {
  const iframeRef = useRef(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on("sync-play", () => {
      iframeRef.current?.contentWindow?.postMessage("play", "*");
    });

    socket.on("sync-pause", () => {
      iframeRef.current?.contentWindow?.postMessage("pause", "*");
    });

    return () => {
      socket.off("chat-message");
      socket.off("sync-play");
      socket.off("sync-pause");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat-message", message);
      setMessage("");
    }
  };

  const handlePlay = () => {
    socket.emit("sync-play");
  };

  const handlePause = () => {
    socket.emit("sync-pause");
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <iframe
          ref={iframeRef}
          src="https://vk.com/video_ext.php?oid=-123456&id=456239017&hash=abc123"
          width="100%"
          height="360"
          frameBorder="0"
          allowFullScreen
        ></iframe>
        <div className="flex gap-2 mt-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-green-500 text-white rounded">
            ▶️ Play
          </button>
          <button onClick={handlePause} className="px-4 py-2 bg-red-500 text-white rounded">
            ⏸ Pause
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl mt-6">
        <div className="border rounded p-4 h-64 overflow-y-scroll bg-gray-100">
          {chat.map((msg, i) => (
            <div key={i} className="mb-2 text-sm">💬 {msg}</div>
          ))}
        </div>
        <div className="flex mt-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow border rounded p-2 mr-2"
            placeholder="Сообщение..."
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded">
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
