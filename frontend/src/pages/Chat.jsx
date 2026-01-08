import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getCurrentUser, logout } from "../api/auth";
import { getConversation, getMessages, newConversation } from "../api/chat";
import { MessageCircle, Send, LogOut, Users, Menu, X } from "lucide-react";

const be = "localhost:8000";
function Chat() {
  const [user, setUser] = useState();
  const [conversation, setConversation] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{ id: 1 }]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const logoutUser = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (e) {
      alert("Cannot logout");
    }
  }

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
      alert("There is error in chatting...");
      console.error("WS error", err);
    };

    return () => ws.current.close();
  }, [selectedConversation]);

  useEffect(() => {
    console.log("Selected Conver: ", selectedConversation);
    getPreviousMessage(selectedConversation?.id);
  }, [selectedConversation]);

  const handleConversationSelect = (conv) => {
    setSelectedConversation(conv);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu Button - Only visible on mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Chatty</h1>
          </div>
          <button
            onClick={logoutUser}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition duration-200"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline font-medium">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto h-[calc(100vh-73px)] relative">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-30
            w-80 bg-white border-r border-gray-200 flex flex-col
            transform transition-transform duration-300 ease-in-out
            lg:transform-none
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ top: '73px', height: 'calc(100vh - 73px)' }}
        >
          {/* New Conversation Form */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <input
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleConversationCreate(e)
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
                    onClick={() => handleConversationSelect(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition duration-200 ${
                      selectedConversation?.id === conv.id
                        ? "bg-indigo-50 border-2 border-indigo-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 truncate">
                        {conv.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">#{conv.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white w-full">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  {selectedConversation.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {messages.length} messages
                </p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {msg.user?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {msg.user?.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {msg.created_at || new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm sm:text-base text-gray-700 bg-gray-50 rounded-lg px-3 sm:px-4 py-2 break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-2 sm:space-x-3">
                  <input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && message.trim()) {
                        if (ws.current?.readyState === WebSocket.OPEN) {
                          ws.current.send(message);
                          setMessage("");
                        }
                      }
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                  />
                  <button
                    onClick={() => {
                      if (ws.current?.readyState === WebSocket.OPEN && message.trim()) {
                        ws.current.send(message);
                        setMessage("");
                      }
                    }}
                    disabled={!message.trim()}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition duration-200 flex items-center space-x-2 font-medium"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                  No conversation selected
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  Choose a conversation from the sidebar to start chatting
                </p>
                {/* Show menu button hint on mobile */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mt-4 lg:hidden px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center space-x-2 mx-auto"
                >
                  <Menu className="w-5 h-5" />
                  <span>Open Conversations</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;