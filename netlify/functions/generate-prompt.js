exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { idea, vibe, subject } = JSON.parse(event.body);

    const userPrompt = `You are a cinematic AI video prompt engineer. Create a professional detailed video generation prompt.

User idea: "${idea || 'not specified'}"
Vibe: "${vibe || 'not specified'}"
Subject: "${subject || 'not specified'}"

Write ONE cinematic prompt. Include: rich scene description, camera movements (low angle, pull back, tracking), lighting, atmosphere, slow motion or depth of field effects.

Format EXACTLY like this (no extra text, no markdown):
PROMPT: [full cinematic visual prompt]
AUDIO: [audio description — music, sounds, dialogue]
TIPS: [2-3 short tips for best results]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.error?.message || 'API error' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data.content?.[0]?.text || '' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
