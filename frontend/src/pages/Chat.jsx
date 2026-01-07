import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { logout } from "../api/auth";
import { getConversation, getMessages, newConversation } from "../api/chat";

const be = "localhost:8000";
function Chat() {
  const [conversation, setConversation] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{ id: 1 }]);
  const ws = useRef(null);

  const handleConversationCreate = async (e) => {
    e.preventDefault();
    try {
      await newConversation(conversation);
      setConversation("");
      handleConversationList();
    } catch (error) {
      console.error(error);
    }
  };

  const handleConversationList = async () => {
    try {
      const response = await getConversation();
      setConversations(response);
    } catch (error) {
      console.error(error);
    }
  };

  const getPreviousMessage = async (cid) => {
  if (!cid) return;  

  try {
    const response = await getMessages(cid); 
    if (Array.isArray(response)) {
      setMessages(response);
    } else {
      console.warn("API did not return an array:", response);
      setMessages([]); 
    }
  } catch (error) {
    console.error(error);
    setMessages([]); 
  }
};

  useEffect(() => {
    handleConversationList();
  }, []);

  useEffect(() => {
    console.log("Selected Conver: ", selectedConversation);
  }, [selectedConversation]);

  // useEffect(() => {
  //   ws.current = new WebSocket(
  //     `ws://localhost:8000/ws?_conversation_id=${selectedConversation?.id}&_user_id=1`
  //   );

  //   ws.current.onmessage = (event) => {
  //     setMessages((prev) => [...prev, event.data]);
  //   };

  //   return () => ws.current.close();
  // }, [selectedConversation]);

  useEffect(() => {
    console.log("Selected Conver: ", selectedConversation);
    getPreviousMessage(selectedConversation?.id);
  }, [selectedConversation]);

  return (
    <div className="flex">
      <div className="flex flex-col">
        <form className="flex flex-col" onSubmit={handleConversationCreate}>
          <input
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder="Enter name of Conversation..."
          />
          <button>Submit</button>
        </form>
        <div className="flex flex-col">
          <h1>Converations List</h1>

          {conversations?.map((conv) => {
            return (
              <div
                className="border-2 border-black border-solid cursor-pointer"
                onClick={() => setSelectedConversation(conv)}
              >
                {conv.id} - {conv.name}
              </div>
            );
          })}
        </div>
      </div>

      {selectedConversation && (
        <div className="flex flex-col">
          <h1>Conversation: {selectedConversation?.name}</h1>
          <div>
            {Array.isArray(messages) &&
              messages.map((msg, ind) => {
                return <div key={ind}>{msg.id}</div>;
              })}
          </div>
          {/* <div className="flex">
            <input
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={() => ws.current.send(message)}>Send</button>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default Chat;
