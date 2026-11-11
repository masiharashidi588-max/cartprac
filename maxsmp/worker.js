const CONFIG_URL = 'https://raw.githubusercontent.com/masiharashidi588-max/cartprac/maxsmp-event-bridge/maxsmp/bridge.json';

function json(data, status, cors) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }, cors || {})
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Access-Control-Max-Age': '86400'
};

async function handle(request) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ error: 'method_not_allowed' }, 405, corsHeaders);
  }

  if (url.pathname === '/health') {
    return json({
      ok: true,
      service: 'maxsmp-config-bridge',
      mode: 'read-only',
      source: 'GitHub branch maxsmp-event-bridge'
    }, 200, corsHeaders);
  }

  if (url.pathname !== '/api/config') {
    return json({ error: 'not_found' }, 404, corsHeaders);
  }

  try {
    const upstream = await fetch(CONFIG_URL, {
      headers: { 'Accept': 'application/json' }
    });

    if (!upstream.ok) {
      return json({
        error: 'configuration_source_unavailable',
        status: upstream.status
      }, 502, corsHeaders);
    }

    const body = await upstream.text();
    const config = JSON.parse(body);

    if (config.schemaVersion !== 1 ||
        config.project !== 'MaxSmpPlugin' ||
        !config.events) {
      return json({ error: 'invalid_configuration_schema' }, 502, corsHeaders);
    }

    const headers = Object.assign({}, corsHeaders, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=30, s-maxage=30'
    });

    const etag = upstream.headers.get('ETag');
    if (etag) headers['ETag'] = etag;

    return new Response(request.method === 'HEAD' ? null : body, {
      status: 200,
      headers
    });
  } catch (error) {
    return json({ error: 'bridge_fetch_failed' }, 502, corsHeaders);
  }
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});
