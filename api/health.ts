import { sendJson, type ApiRequest, type ApiResponse } from './_lib/cake-ai';

export default function handler(_req: ApiRequest, res: ApiResponse): void {
  sendJson(res, 200, { ok: true });
}
