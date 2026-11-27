import {
  generateCakePayload,
  readJsonBody,
  sendJson,
} from './_lib/cake-ai.mjs';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await generateCakePayload(body);
    sendJson(res, result.status, result.data);
  } catch (err) {
    console.error('Generate Cake Error:', err);
    const isTimeout =
      err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    if (isTimeout) {
      sendJson(res, 504, {
        error: 'Image generation timed out while waiting for Cloudflare AI. Please try again.',
      });
      return;
    }
    if (err instanceof SyntaxError) {
      sendJson(res, 400, { error: 'Invalid JSON request body.' });
      return;
    }
    const message = err instanceof Error ? err.message : 'Failed to generate custom cake';
    sendJson(res, 500, { error: message });
  }
}
