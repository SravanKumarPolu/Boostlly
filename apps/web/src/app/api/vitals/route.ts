export async function POST(request: Request): Promise<Response> {
  // Consume body (ignore errors); this silences noisy 404s from Web Vitals pings
  try {
    await request.json().catch(() => null);
  } catch {}
  return new Response(null, { status: 200 });
}

export async function GET(): Promise<Response> {
  return new Response("OK", { status: 200 });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
