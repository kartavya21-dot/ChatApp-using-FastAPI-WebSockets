import { useEffect, useRef, useState } from "react";
import axios from "axios";

const be = "localhost:8000";
function Chat() {
  const [user, setUser] = useState("");
  const [conversation, setConversation] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  const handleUserCreate = async (e) => {
    // http://localhost:8000/
    e.preventDefault();

    try {
      await axios.post(`http://${be}/user`, { name: user });
    } catch (error) {
      console.error(error);
    }
  };

  const handleConversationCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://${be}/conversation`, { name: conversation });
      handleConversationList();
    } catch (error) {
      console.error(error);
    }
  };

  const handleConversationList = async () => {
    try {
      const response = await axios.get(`http://${be}/conversation`);
      setConversations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getPreviousMessage = async (cid, uid) => {
    try {
      const response = await axios.get(`http://${be}/messages`, {
        params: {
          _user_id: 1,
          _conversation_id: selectedConversation.id,
        },
      });
      console.log(response.data);

      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleConversationList();
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(
      `ws://localhost:8000/ws?_conversation_id=${selectedConversation?.id}&_user_id=1`
    );

    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => ws.current.close();
  }, [selectedConversation]);

  useEffect(() => {
    getPreviousMessage(selectedConversation?.id, 1);
  }, [selectedConversation]);

  return (
    <div className="flex">
      <div className="flex flex-col">
        <form onSubmit={handleUserCreate}>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Enter your name..."
          />
          <button>Submit</button>
        </form>
        <form onSubmit={handleConversationCreate}>
          <input
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder="Enter name of Conversation..."
          />
          <button>Submit</button>
        </form>
        <div className="flex flex-col">
          <h1>Converations List</h1>

          {conversations?.map((conversation) => {
            return (
              <div
                className="border-2 border=black border-solid cursor-pointer"
                onClick={() => setSelectedConversation(conversation)}
              >
                {conversation.id} - {conversation.name}
              </div>
            );
          })}
        </div>
      </div>

      {selectedConversation && (
        <div className="flex flex-col">
          <h1>Conversation: {selectedConversation?.name}</h1>
          <div>
            {messages?.map((message) => {
              return <div>{message.user_id} - {message.message}</div>;
            })}
          </div>
          <div className="flex">
            <input
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={() => ws.current.send(message)}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;