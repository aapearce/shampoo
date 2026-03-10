// Centralised Anthropic API helper
// API key is injected at build time via VITE_ANTHROPIC_API_KEY in .env.local

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function claudeChat({ system, messages, max_tokens = 1000 }) {
  if (!API_KEY) {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY — please add it to your .env.local file')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      ...(system ? { system } : {}),
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content.map(i => i.text || '').join('')
}
