exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { idea, vibe, subject } = JSON.parse(event.body || "{}");

    const userPrompt = `
You are a cinematic AI video prompt engineer.

Create ONE professional cinematic video generation prompt.

Idea: ${idea || "Not specified"}
Vibe: ${vibe || "Not specified"}
Subject: ${subject || "Not specified"}

Format EXACTLY as:

PROMPT: [full cinematic visual prompt]
AUDIO: [audio description]
TIPS: [2-3 short tips]
`;

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: userPrompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic Error:", data);

      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: data?.error?.message || "Anthropic API Error"
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: data.content?.[0]?.text || ""
      })
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
