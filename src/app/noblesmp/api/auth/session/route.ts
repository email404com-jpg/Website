import { json, readSessionCookie } from '../../_lib';

export async function GET(req: Request): Promise<Response> {
  const session = readSessionCookie(req);
  if (!session) return json({ error: 'Not signed in.' }, 401);
  return json(session);
}
