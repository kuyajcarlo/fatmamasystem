import { GoogleGenAI, Type } from '@google/genai';

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return req.body.trim() ? JSON.parse(req.body) : {};
  }
  if (Buffer.isBuffer(req.body)) {
    const str = req.body.toString('utf8');
    return str.trim() ? JSON.parse(str) : {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

export function readSecret(name) {
  const raw = process.env[name];
  if (!raw) return '';
  let trimmed = raw.trim();
  if (trimmed.startsWith(`${name}=`)) {
    trimmed = trimmed.slice(name.length + 1).trim();
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  const lower = trimmed.toLowerCase();
  if (
    !trimmed ||
    trimmed.includes('...') ||
    lower.includes('your ') ||
    lower.includes('placeholder')
  ) {
    return '';
  }
  return trimmed;
}

function getGeminiClient(apiKey, vertexai = false) {
  return new GoogleGenAI({
    apiKey,
    ...(vertexai ? { vertexai: true } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function formatGeminiError(err) {
  const raw = err instanceof Error ? err.message : String(err || 'Gemini request failed');
  if (raw.includes('API_KEY_INVALID') || raw.includes('API key not valid')) {
    return 'Your GEMINI_API_KEY is not valid. Please check or update GEMINI_API_KEY in Settings > Secrets or Vercel Environment Variables.';
  }
  if (raw.includes('PERMISSION_DENIED')) {
    return 'Gemini API permission denied. Please check your GEMINI_API_KEY in Settings > Secrets or Vercel Environment Variables.';
  }
  if (raw.includes('RESOURCE_EXHAUSTED')) {
    return 'Gemini API quota exceeded. Please check your plan or key.';
  }
  return raw;
}

function stripDataUrlPrefix(input) {
  return input.includes(',') ? input.split(',')[1] : input;
}

function clampCoord(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(1000, Math.round(num)));
}

function clampDimension(val, fallback = 768) {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  const clamped = Math.max(256, Math.min(1024, Math.round(num)));
  return Math.round(clamped / 16) * 16;
}

function sanitizeAnalysis(raw) {
  const validIcing = raw?.icingType === 'Fondant' ? 'Fondant' : 'Soft Icing';
  const validTypes = ['Bento', '1 Tier', 'Square', 'Rectangle', 'Slab Cake'];
  const cakeType = validTypes.includes(raw?.cakeType) ? raw.cakeType : '1 Tier';
  const validFlavors = ['Chocolate', 'Ube', 'Vanilla', 'Mocha'];
  const flavor = validFlavors.includes(raw?.flavor) ? raw.flavor : 'Chocolate';

  const details = Array.isArray(raw?.details)
    ? raw.details.slice(0, 6).map((d, idx) => {
        const box = Array.isArray(d?.box_2d) ? d.box_2d : [150, 150, 850, 850];
        const ymin = clampCoord(box[0]);
        const xmin = clampCoord(box[1]);
        const ymax = Math.max(ymin + 20, clampCoord(box[2]));
        const xmax = Math.max(xmin + 20, clampCoord(box[3]));
        return {
          id: String(d?.id || idx + 1),
          label: String(d?.label || `Cake Detail ${idx + 1}`).slice(0, 80),
          box_2d: [ymin, xmin, Math.min(1000, ymax), Math.min(1000, xmax)],
        };
      })
    : [];

  return {
    icingType: validIcing,
    cakeType,
    flavor,
    suggestedBasePrice:
      typeof raw?.suggestedBasePrice === 'number' && Number.isFinite(raw.suggestedBasePrice)
        ? Math.max(450, Math.min(10000, Math.round(raw.suggestedBasePrice)))
        : 650,
    summary: String(raw?.summary || 'Custom cake ready for editing.').slice(0, 280),
    originalAppearance: String(raw?.originalAppearance || '').slice(0, 600),
    details,
  };
}

export async function analyzeCakePayload(body) {
  const apiKey = readSecret('GEMINI_API_KEY') || readSecret('API_KEY');
  if (!apiKey) {
    return {
      status: 500,
      data: {
        error:
          'Missing or placeholder GEMINI_API_KEY. Please add GEMINI_API_KEY in Settings > Secrets or Vercel Environment Variables.',
      },
    };
  }

  const { imageBase64, mimeType } = body || {};
  if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
    return { status: 400, data: { error: 'Please upload a cake image.' } };
  }

  const safeMime =
    typeof mimeType === 'string' && ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())
      ? mimeType.toLowerCase()
      : 'image/jpeg';

  const cleanBase64 = stripDataUrlPrefix(imageBase64);
  if (cleanBase64.length > 14_000_000) {
    return {
      status: 400,
      data: { error: 'Uploaded image is too large. Please use a smaller photo.' },
    };
  }

  const prompt = `
Analyze this cake photo for a custom cake designer app (like Genie.ph).
Detect the cake properties AND detect 3 to 6 distinct editable visual details on the cake with accurate 2D bounding boxes (normalized coordinates 0 to 1000: [ymin, xmin, ymax, xmax]).
Examples of details: "Birthday Candles", "Top Piped Swirls", "Sprinkles Border", "Main Frosting Body", "Cake Topper", "Drizzle".

Return ONLY raw valid JSON matching the requested schema.
`.trim();

  const attempts = [
    { vertexai: false, model: 'gemini-4-hydrogen' },
    { vertexai: false, model: 'gemini-3.1-flash-lite' },
    ...(apiKey.startsWith('AQ.')
      ? [
          { vertexai: true, model: 'gemini-2.5-flash' },
          { vertexai: true, model: 'gemini-4-hydrogen' },
        ]
      : []),
  ];

  let rawText = '';
  let lastError = null;

  for (const attempt of attempts) {
    try {
      const ai = getGeminiClient(apiKey, attempt.vertexai);
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents: {
          parts: [
            { inlineData: { mimeType: safeMime, data: cleanBase64 } },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              icingType: { type: Type.STRING, enum: ['Soft Icing', 'Fondant'] },
              cakeType: {
                type: Type.STRING,
                enum: ['Bento', '1 Tier', 'Square', 'Rectangle', 'Slab Cake'],
              },
              flavor: {
                type: Type.STRING,
                enum: ['Chocolate', 'Ube', 'Vanilla', 'Mocha'],
              },
              suggestedBasePrice: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              originalAppearance: { type: Type.STRING },
              details: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    box_2d: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (response.text) {
        rawText = response.text;
        lastError = null;
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(
        `Model ${attempt.model} (vertexai=${attempt.vertexai}) failed during cake scan, trying fallback...`,
        err
      );
    }
  }

  if (lastError && !rawText) {
    throw lastError;
  }

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  return { status: 200, data: sanitizeAnalysis(parsed) };
}

export async function generateCakePayload(body) {
  const geminiKey = readSecret('GEMINI_API_KEY') || readSecret('API_KEY');
  const cfAccountId = readSecret('CLOUDFLARE_ACCOUNT_ID');
  const cfToken = readSecret('CLOUDFLARE_API_TOKEN');

  if (!cfAccountId || !cfToken) {
    return {
      status: 500,
      data: {
        error:
          'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in Settings > Secrets or Vercel Environment Variables.',
      },
    };
  }

  if (typeof body?.imageBase64 !== 'string' || !body.imageBase64.trim()) {
    return { status: 400, data: { error: 'Please upload a cake photo first.' } };
  }

  const cleanBase64 = stripDataUrlPrefix(body.imageBase64);
  if (cleanBase64.length > 14_000_000) {
    return {
      status: 400,
      data: { error: 'Uploaded image is too large. Please use a smaller photo.' },
    };
  }

  const safeMime =
    typeof body.mimeType === 'string' && ALLOWED_MIME_TYPES.has(body.mimeType.toLowerCase())
      ? body.mimeType.toLowerCase()
      : 'image/jpeg';

  const requestedChanges = [];

  if (body.flavor && body.flavor !== 'Same as Photo') {
    requestedChanges.push(
      `Change the main cake frosting color and flavor appearance to ${String(body.flavor).slice(0, 60)}`
    );
  }
  if (body.colorName && body.colorName !== 'Keep Original') {
    requestedChanges.push(
      `Make the primary frosting color ${String(body.colorName).slice(0, 40)}`
    );
  }
  if (body.icingType && body.icingType !== 'Same as Photo') {
    requestedChanges.push(
      `Use a ${String(body.icingType).slice(0, 50)} frosting finish`
    );
  }
  if (typeof body.layers === 'number' && body.layers > 1 && body.layers <= 6) {
    requestedChanges.push(
      `Make the cake taller with ${body.layers} stacked cake layers/tiers`
    );
  }
  if (body.size) {
    requestedChanges.push(
      `Adjust proportions slightly for a ${String(body.size).slice(0, 40)} cake`
    );
  }
  if (body.topper && body.topper !== 'Keep Original') {
    requestedChanges.push(
      body.topper === 'None'
        ? 'Remove the top cake topper/candles cleanly'
        : `Change or add the cake topper to ${String(body.topper).slice(0, 80)}`
    );
  }
  if (typeof body.cakeText === 'string' && body.cakeText.trim() !== '') {
    requestedChanges.push(
      `Pipe neat icing lettering reading "${body.cakeText.trim().slice(0, 80)}" directly onto the top of the cake`
    );
  }
  if (Array.isArray(body.detailEdits) && body.detailEdits.length > 0) {
    body.detailEdits.slice(0, 10).forEach((d) => {
      if (d?.label && d?.edit) {
        requestedChanges.push(
          `For ${String(d.label).slice(0, 60)}: ${String(d.edit).slice(0, 200)}`
        );
      }
    });
  }
  if (typeof body.instructions === 'string' && body.instructions.trim() !== '') {
    requestedChanges.push(body.instructions.trim().slice(0, 300));
  }

  const changesList =
    requestedChanges.length > 0
      ? requestedChanges.join('; ')
      : 'Subtly enhance bakery lighting while keeping the exact same cake';

  let editPrompt = `Keep the exact cake, plate, background, lighting, and camera angle from the reference photo, and only edit the following: ${changesList}. Do not invent a different cake or background.`;

  if (geminiKey) {
    const promptBuilder = `
Look closely at the attached reference cake photo.
Write a single concise image-editing prompt (under 110 words) for FLUX.2 (which receives this photo as input_image_0).

CRITICAL RULE: The output MUST look like the EXACT SAME photo and cake the user uploaded — same camera angle, same plate/stand, same table/background, same lighting, and keeping every untouched decoration identical.
ONLY apply these requested edits:
${(requestedChanges.length > 0 ? requestedChanges : [changesList]).map((c) => `- ${c}`).join('\n')}

Start your prompt with: "Keep the exact cake, plate, background, lighting, and camera angle from the reference photo, and only edit..."
Return ONLY the prompt text, no quotes or markdown.
`.trim();

    const promptAttempts = [
      { vertexai: false, model: 'gemini-4-hydrogen' },
      ...(geminiKey.startsWith('AQ.') ? [{ vertexai: true, model: 'gemini-2.5-flash' }] : []),
    ];

    for (const attempt of promptAttempts) {
      try {
        const ai = getGeminiClient(geminiKey, attempt.vertexai);
        const geminiRes = await ai.models.generateContent({
          model: attempt.model,
          contents: {
            parts: [
              { inlineData: { mimeType: safeMime, data: cleanBase64 } },
              { text: promptBuilder },
            ],
          },
        });

        if (geminiRes.text?.trim()) {
          editPrompt = geminiRes.text.trim();
          break;
        }
      } catch (geminiErr) {
        console.warn(
          `Gemini vision prompt builder (${attempt.model}, vertexai=${attempt.vertexai}) failed, trying fallback:`,
          geminiErr
        );
      }
    }
  }

  const imageBuffer = Buffer.from(cleanBase64, 'base64');
  const imageBlob = new Blob([imageBuffer], { type: safeMime });
  const outW = clampDimension(body.outputWidth, 768);
  const outH = clampDimension(body.outputHeight, 768);

  const formData = new FormData();
  formData.append('prompt', editPrompt);
  formData.append('input_image_0', imageBlob, 'cake.jpg');
  formData.append('width', String(outW));
  formData.append('height', String(outH));
  formData.append('guidance', '3.5');

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(cfAccountId)}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfToken}`,
      },
      body: formData,
      signal: AbortSignal.timeout(45000),
    }
  );

  const contentType = cfRes.headers.get('content-type') || '';
  if (!cfRes.ok) {
    const errText = await cfRes.text();
    return {
      status: 502,
      data: {
        error: `Cloudflare AI Error (${cfRes.status}): ${errText || 'Empty error response'}`,
      },
    };
  }

  if (contentType.includes('application/json')) {
    const cfText = await cfRes.text();
    if (!cfText || !cfText.trim()) {
      return {
        status: 502,
        data: { error: 'Cloudflare AI returned an empty JSON response.' },
      };
    }

    let json;
    try {
      json = JSON.parse(cfText);
    } catch {
      return {
        status: 502,
        data: { error: 'Cloudflare AI returned malformed JSON.' },
      };
    }

    if (!json.result?.image) {
      return {
        status: 502,
        data: { error: json.errors?.[0]?.message || 'Cloudflare did not return an image.' },
      };
    }

    return {
      status: 200,
      data: {
        generatedImage: `data:image/jpeg;base64,${json.result.image}`,
        promptUsed: editPrompt,
      },
    };
  }

  const arrayBuf = await cfRes.arrayBuffer();
  if (!arrayBuf || arrayBuf.byteLength === 0) {
    return {
      status: 502,
      data: { error: 'Cloudflare AI returned an empty image response.' },
    };
  }
  const base64Out = Buffer.from(arrayBuf).toString('base64');
  return {
    status: 200,
    data: {
      generatedImage: `data:image/png;base64,${base64Out}`,
      promptUsed: editPrompt,
    },
  };
}
