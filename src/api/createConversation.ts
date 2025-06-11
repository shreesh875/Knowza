import type { IConversation } from "../types";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token,
    },
    body: JSON.stringify({
  persona_id: "p4483df9ffff",
  replica_id: "r9244a899ae0", // Add this line
  properties: {
    apply_greenscreen: false,
  },
}),
  });

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
