import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getCurrentUser, logout } from "../api/auth";
import { getConversation, getMessages, newConversation } from "../api/chat";
import { MessageCircle, Send, LogOut, Users } from "lucide-react";

const be = "localhost:8000";
function Chat() {
  const [user, setUser] = useState();
  const [conversation, setConversation] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{ id: 1 }]);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const handleConversationCreate = async (e) => {
    e.preventDefault();
    try {
      await newConversation(conversation);
      setConversation("");
      handleConversationList();
    } catch (error) {
      console.error(error);
      alert("Cannot create conversation, Try Again!!");
    }
  };

  const getUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response);
    } catch (e) {
      console.error(e);
      alert("Cannot find you, Sorry!! Try again later");
    }
  };

  const handleConversationList = async () => {
    try {
      const response = await getConversation();
      setConversations(response);
    } catch (error) {
      console.error(error);
      alert("Cannot find your chat list");
    }
  };

  const getPreviousMessage = async (cid) => {
    if (!cid) return;

    try {
      const response = await getMessages(cid);
      if (Array.isArray(response)) {
        console.log("API return an array:", response);
        setMessages(response);
      } else {
        console.warn("API did not return an array:", response);
        setMessages([]);
      }
    } catch (error) {
      console.error(error);
      setMessages([]);
      alert("Cannot fetch your messages");
    }
  };

  useEffect(() => {
    getUser();
    handleConversationList();
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  useEffect(() => {
    console.log("Selected Conver: ", selectedConversation);
  }, [selectedConversation]);

  useEffect(() => {
    if (!selectedConversation || !user) return;

    ws.current = new WebSocket(
      `ws://localhost:8000/ws?_conversation_id=${selectedConversation?.id}&_user_id=${user.id}`
    );

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    ws.current.onerror = (err) => {
      alert("There is error in chatting...")
      console.error("WS error", err);
    };

    return () => ws.current.close();
  }, [selectedConversation]);

  useEffect(() => {
    console.log("Selected Conver: ", selectedConversation);
    getPreviousMessage(selectedConversation?.id);
  }, [selectedConversation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">ChatApp</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* New Conversation Form */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <input
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleConversationCreate()
                }
                placeholder="New conversation name..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
              <button
                onClick={handleConversationCreate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition duration-200"
              >
                Create Conversation
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Conversations
                </h2>
              </div>
              <div className="space-y-2">
                {conversations?.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition duration-200 ${
                      selectedConversation?.id === conv.id
                        ? "bg-indigo-50 border-2 border-indigo-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {conv.name}
                      </span>
                      <span className="text-xs text-gray-500">#{conv.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedConversation.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {messages.length} messages
                </p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {msg.user?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-semibold text-gray-800">
                          {msg.user?.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.created_at || new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700 bg-gray-50 rounded-lg px-4 py-2 inline-block">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={() => {
                      if (ws.current?.readyState === WebSocket.OPEN) {
                        ws.current.send(message);
                        setMessage("");
                      }
                    }}
                    disabled={!message.trim()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 flex items-center space-x-2 font-medium"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
