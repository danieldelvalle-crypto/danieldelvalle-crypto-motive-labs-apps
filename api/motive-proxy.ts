import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy for Motive Public API calls
 *
 * Solves CORS by moving API calls to server-side.
 * Forwards the session token from client without storing it.
 *
 * Security:
 * - Session-only token handling (no persistence)
 * - Read-only endpoints only
 * - Validates Authorization header presence
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST (prevents URL-based token leakage)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract token from request body (never from URL)
  const { endpoint, token } = req.body;

  if (!endpoint || !token) {
    return res.status(400).json({ error: 'Missing endpoint or token' });
  }

  // Only allow read-only Motive Public API endpoints
  const allowedEndpoints = [
    '/v1/vehicles',
    '/v1/fault_codes',
    '/v1/inspection_reports',
    '/v1/vehicle_stats',
  ];

  const isAllowed = allowedEndpoints.some(allowed =>
    endpoint === allowed || endpoint.startsWith(`${allowed}/`) || endpoint.startsWith(`${allowed}?`)
  );

  if (!isAllowed) {
    return res.status(403).json({ error: 'Endpoint not allowed' });
  }

  try {
    // Forward request to Motive Public API
    const motiveUrl = `https://api.gomotive.com${endpoint}`;

    const response = await fetch(motiveUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      return res.status(response.status).json({
        error: `Motive API error: ${response.status} ${error}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}
