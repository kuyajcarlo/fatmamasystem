import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

interface DetectedDetail {
  id: string;
  label: string;
  box_2d: [number, number, number, number];
}

interface CakeAnalysisResponse {
  icingType: 'Fondant' | 'Soft Icing';
  cakeType: 'Bento' | '1 Tier' | 'Square' | 'Rectangle' | 'Slab Cake';
  flavor: 'Chocolate' | 'Ube' | 'Vanilla' | 'Mocha';
  suggestedBasePrice: number;
  summary: string;
  originalAppearance: string;
  details: DetectedDetail[];
}

interface GenerateRequestBody {
  imageBase64?: string;
  mimeType?: string;
  outputWidth?: number;
  outputHeight?: number;
  icingType?: string | null;
  flavor?: string | null;
  size?: string | null;
  layers?: number | null;
  colorName?: string | null;
  topper?: string | null;
  cakeText?: string;
  detailEdits?: Array<{ label: string; edit: string }>;
  instructions?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

function readSecret(name: string): string {
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

function getGeminiClient(apiKey: string, vertexai = false): GoogleGenAI {
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

function formatGeminiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err || 'Gemini request failed');
  if (raw.includes('API_KEY_INVALID') || raw.includes('API key not valid')) {
    return 'Your GEMINI_API_KEY is not valid. Please check or update GEMINI_API_KEY in Settings > Secrets.';
  }
  if (raw.includes('PERMISSION_DENIED')) {
    return 'Gemini API permission denied. Please check your GEMINI_API_KEY in Settings > Secrets.';
  }
  if (raw.includes('RESOURCE_EXHAUSTED')) {
    return 'Gemini API quota exceeded. Please check your plan or key in Settings > Secrets.';
  }
  return raw;
}

function stripDataUrlPrefix(input: string): string {
  return input.includes(',') ? input.split(',')[1] : input;
}

function clampCoord(val: unknown): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(1000, Math.round(num)));
}

function clampDimension(val: unknown, fallback = 768): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  const clamped = Math.max(256, Math.min(1024, Math.round(num)));
  return Math.round(clamped / 16) * 16;
}

function sanitizeAnalysis(raw: Partial<CakeAnalysisResponse>): CakeAnalysisResponse {
  const validIcing = raw.icingType === 'Fondant' ? 'Fondant' : 'Soft Icing';
  const validTypes = ['Bento', '1 Tier', 'Square', 'Rectangle', 'Slab Cake'] as const;
  const cakeType = validTypes.includes(raw.cakeType as (typeof validTypes)[number])
    ? (raw.cakeType as CakeAnalysisResponse['cakeType'])
    : '1 Tier';
  const validFlavors = ['Chocolate', 'Ube', 'Vanilla', 'Mocha'] as const;
  const flavor = validFlavors.includes(raw.flavor as (typeof validFlavors)[number])
    ? (raw.flavor as CakeAnalysisResponse['flavor'])
    : 'Chocolate';

  const details: DetectedDetail[] = Array.isArray(raw.details)
    ? raw.details.slice(0, 6).map((d, idx) => {
        const box = Array.isArray(d?.box_2d) ? d.box_2d : [150, 150, 850, 850];
        const ymin = clampCoord(box[0]);
        const xmin = clampCoord(box[1]);
        const ymax = Math.max(ymin + 20, clampCoord(box[2]));
        const xmax = Math.max(xmin + 20, clampCoord(box[3]));
        return {
          id: String(d?.id || idx + 1),
          label: String(d?.label || `Cake Detail ${idx + 1}`).slice(0, 80),
          box_2d: [
            ymin,
            xmin,
            Math.min(1000, ymax),
            Math.min(1000, xmax),
          ],
        };
      })
    : [];

  return {
    icingType: validIcing,
    cakeType,
    flavor,
    suggestedBasePrice:
      typeof raw.suggestedBasePrice === 'number' && Number.isFinite(raw.suggestedBasePrice)
        ? Math.max(450, Math.min(10000, Math.round(raw.suggestedBasePrice)))
        : 650,
    summary: String(raw.summary || 'Custom cake ready for editing.').slice(0, 280),
    originalAppearance: String(raw.originalAppearance || '').slice(0, 600),
    details,
  };
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/analyze-cake', async (req: Request, res: Response) => {
    try {
      const apiKey = readSecret('GEMINI_API_KEY') || readSecret('API_KEY');
      if (!apiKey) {
        res.status(500).json({
          error: 'Missing or placeholder GEMINI_API_KEY. Please add your Gemini API key in Settings > Secrets.',
        });
        return;
      }

      const { imageBase64, mimeType } = (req.body || {}) as {
        imageBase64?: unknown;
        mimeType?: unknown;
      };

      if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
        res.status(400).json({ error: 'Please upload a cake image.' });
        return;
      }

      const safeMime =
        typeof mimeType === 'string' && ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())
          ? mimeType.toLowerCase()
          : 'image/jpeg';

      const cleanBase64 = stripDataUrlPrefix(imageBase64);
      if (cleanBase64.length > 14_000_000) {
        res.status(400).json({ error: 'Uploaded image is too large. Please use a smaller photo.' });
        return;
      }

      const prompt = `
Analyze this cake photo for a custom cake designer app (like Genie.ph).
Detect the cake properties AND detect 3 to 6 distinct editable visual details on the cake with accurate 2D bounding boxes (normalized coordinates 0 to 1000: [ymin, xmin, ymax, xmax]).
Examples of details: "Birthday Candles", "Top Piped Swirls", "Sprinkles Border", "Main Frosting Body", "Cake Topper", "Drizzle".

Return ONLY raw valid JSON matching the requested schema.
`.trim();

      const attempts: Array<{ vertexai: boolean; model: string }> = [
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
      let lastError: unknown = null;

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

      const parsed = JSON.parse(cleaned) as Partial<CakeAnalysisResponse>;
      res.json(sanitizeAnalysis(parsed));
    } catch (err) {
      console.error('Analyze Cake Error:', err);
      res.status(500).json({ error: formatGeminiError(err) });
    }
  });

  app.post('/api/generate-cake', async (req: Request, res: Response) => {
    try {
      const geminiKey = readSecret('GEMINI_API_KEY') || readSecret('API_KEY');
      const cfAccountId = readSecret('CLOUDFLARE_ACCOUNT_ID');
      const cfToken = readSecret('CLOUDFLARE_API_TOKEN');

      if (!cfAccountId || !cfToken) {
        res.status(500).json({
          error: 'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in Settings > Secrets.',
        });
        return;
      }

      const body = (req.body || {}) as GenerateRequestBody;
      if (typeof body.imageBase64 !== 'string' || !body.imageBase64.trim()) {
        res.status(400).json({ error: 'Please upload a cake photo first.' });
        return;
      }

      const cleanBase64 = stripDataUrlPrefix(body.imageBase64);
      if (cleanBase64.length > 14_000_000) {
        res.status(400).json({ error: 'Uploaded image is too large. Please use a smaller photo.' });
        return;
      }

      const safeMime =
        typeof body.mimeType === 'string' && ALLOWED_MIME_TYPES.has(body.mimeType.toLowerCase())
          ? body.mimeType.toLowerCase()
          : 'image/jpeg';

      const requestedChanges: string[] = [];

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

        const promptAttempts: Array<{ vertexai: boolean; model: string }> = [
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
        res.status(502).json({
          error: `Cloudflare AI Error (${cfRes.status}): ${errText || 'Empty error response'}`,
        });
        return;
      }

      if (contentType.includes('application/json')) {
        const cfText = await cfRes.text();
        if (!cfText || !cfText.trim()) {
          res.status(502).json({
            error: 'Cloudflare AI returned an empty JSON response.',
          });
          return;
        }
        let json: {
          success?: boolean;
          result?: { image?: string };
          errors?: Array<{ message: string }>;
        };
        try {
          json = JSON.parse(cfText);
        } catch {
          res.status(502).json({
            error: 'Cloudflare AI returned malformed JSON.',
          });
          return;
        }

        if (!json.result?.image) {
          res.status(502).json({
            error: json.errors?.[0]?.message || 'Cloudflare did not return an image.',
          });
          return;
        }

        res.json({
          generatedImage: `data:image/jpeg;base64,${json.result.image}`,
          promptUsed: editPrompt,
        });
      } else {
        const arrayBuf = await cfRes.arrayBuffer();
        if (!arrayBuf || arrayBuf.byteLength === 0) {
          res.status(502).json({
            error: 'Cloudflare AI returned an empty image response.',
          });
          return;
        }
        const base64Out = Buffer.from(arrayBuf).toString('base64');
        res.json({
          generatedImage: `data:image/png;base64,${base64Out}`,
          promptUsed: editPrompt,
        });
      }
    } catch (err) {
      console.error('Generate Cake Error:', err);
      const isTimeout =
        err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
      if (isTimeout) {
        res.status(504).json({
          error: 'Image generation timed out while waiting for Cloudflare AI. Please try again.',
        });
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to generate custom cake';
      res.status(500).json({ error: message });
    }
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    const errObj = err as {
      status?: number;
      statusCode?: number;
      type?: string;
      message?: string;
    };
    const status = errObj?.status || errObj?.statusCode || 500;
    if (req.path.startsWith('/api')) {
      const message =
        errObj?.type === 'entity.too.large' || status === 413
          ? 'Uploaded image payload is too large. Please try a smaller photo.'
          : errObj?.message || 'Internal server error.';
      res.status(status).json({ error: message });
      return;
    }
    next(err);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: __dirname,
      server: {
        middlewareMode: true,
        hmr: false,
        host: '0.0.0.0',
        port: PORT,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fat Mama server listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
