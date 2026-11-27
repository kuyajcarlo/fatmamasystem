import {
  analyzeCakePayload,
  formatGeminiError,
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
    const result = await analyzeCakePayload(body);
    sendJson(res, result.status, result.data);
  } catch (err) {
    console.error('Analyze Cake Error:', err);
    if (err instanceof SyntaxError) {
      sendJson(res, 400, { error: 'Invalid JSON request body.' });
      return;
    }
    sendJson(res, 500, { error: formatGeminiError(err) });
  }
}
