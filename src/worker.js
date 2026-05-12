import UI_HTML from './index.html';

function compareSemVer(a, b) {
  const cleanA = a.replace(/^v/, '').split(/[+-]/)[0];
  const cleanB = b.replace(/^v/, '').split(/[+-]/)[0];

  const pa = cleanA.split('.').map(Number);
  const pb = cleanB.split('.').map(Number);

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;

    const safeNa = isNaN(na) ? 0 : na;
    const safeNb = isNaN(nb) ? 0 : nb;

    if (safeNa > safeNb) return 1;
    if (safeNb > safeNa) return -1;
  }

  if (a === b) return 0;

  const suffixA = a.substring(cleanA.length); // e.g., "+git219.6ebfd32"
  const suffixB = b.substring(cleanB.length); // e.g., "+git242.8b34a8b"

  const numMatchA = suffixA.match(/\d+/);
  const numMatchB = suffixB.match(/\d+/);

  if (numMatchA && numMatchB) {
    const numA = parseInt(numMatchA[0], 10);
    const numB = parseInt(numMatchB[0], 10);
    if (numA > numB) return 1;
    if (numB > numA) return -1;
  }

  return a > b ? 1 : -1;
}

async function saveToEdgeCache(request, stringData, ttlSeconds) {
  const cacheResponse = new Response(stringData, {
    headers: { 'Cache-Control': `s-maxage=${ttlSeconds}` }
  });
  await caches.default.put(request, cacheResponse);
}

export default {
  async fetch(request, env, ctx) {
    const requestUrl = new URL(request.url);
    const targetPkg = requestUrl.searchParams.get('pkg');
    const targetUser = requestUrl.searchParams.get('user');

    if (!targetPkg && !targetUser) {
      return new Response(UI_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    if (!targetPkg || !targetUser) {
      return new Response("Missing required 'pkg' or 'user' query parameters.", {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    let cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      const hitResponse = new Response(cachedResponse.body, cachedResponse);
      hitResponse.headers.set('X-Proxy-Cache', 'HIT');
      return hitResponse;
    }

    const baseUrl = env.REGISTRY_BASE_URL || "https://apt.fury.io";
    const safeUser = targetUser.replace(/[^a-zA-Z0-9_-]/g, "");
    const targetRepoUrl = `${baseUrl}/${safeUser}/Packages`;

    try {
      const response = await fetch(targetRepoUrl);

      if (!response.ok) {
        return new Response(`Failed to fetch upstream repository: ${response.status}`, { status: 502 });
      }

      const rawText = await response.text();
      const blocks = rawText.split(/\r?\n\r?\n/);

      let latestVersion = "0.0.0";

      for (const block of blocks) {
        const pkgMatch = block.match(/^Package:\s*(.+)$/m);
        const versionMatch = block.match(/^Version:\s*(.+)$/m);

        if (versionMatch) {
          const currentPkg = pkgMatch ? pkgMatch[1].trim() : "";
          if (currentPkg !== targetPkg) continue;

          const currentVersion = versionMatch[1].trim();
          if (compareSemVer(currentVersion, latestVersion) > 0) {
            latestVersion = currentVersion;
          }
        }
      }

      if (latestVersion === "0.0.0") {
         return new Response(`Package '${targetPkg}' not found for user '${safeUser}'.`, { status: 404 });
      }

      const finalResponse = new Response(latestVersion, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600'
        }
      });

      const ttl = env.EDGE_CACHE_TTL || 3600;
      ctx.waitUntil(saveToEdgeCache(cacheKey, latestVersion, ttl));

      finalResponse.headers.set('X-Proxy-Cache', 'MISS');
      return finalResponse;

    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
