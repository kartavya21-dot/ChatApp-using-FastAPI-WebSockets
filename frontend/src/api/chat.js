import { api } from "./api.js";

export const newConversation = async (name) => {
  try {
    const response = await api.post("/conversation", { name });
    return response.data;
  } catch (e) {
    return e;
  }
};

export const getConversation = async () => {
  try {
    const response = await api.get("/conversation");
    return response.data;
  } catch (e) {
    return e;
  }
};

export const getMessages = async (conversation_id) => {
  conversation_id = parseInt(conversation_id);
  try {
    const response = await api.get("/messages", {
      params: { conversation_id },
    });
    return response.data;
  } catch (e) {
    return e;
  }
};

export const deleteMessageById = async (msgId) => {
  const id = parseInt(msgId);
  const response = await api.delete(`/message/${id}`);
  return response.data;
};
