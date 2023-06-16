// lib/OpenAIRequest.ts
export interface OpenAIRequestPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
}

export async function OpenAIRequest(payload: OpenAIRequestPayload) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // convert the res to a string and return the error
    console.log(res);
    return res.text();
    throw new Error("Error in OpenAI API request");
  }

  const data = await res.json();
  console.log(data);
  const text = data.choices[0].message.content;
  console.log(data.choices[0].message.content);
  return text;
}
