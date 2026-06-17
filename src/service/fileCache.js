const CACHE_NAME = 'sharepoint-files-v1';

/**
 * Gera uma chave sintética para o cache (sem depender da URL autenticada)
 */
function cacheKey(serverRelativeUrl) {
  return `/__file-cache__${serverRelativeUrl}`;
}

/**
 * Tenta buscar do cache; se não tiver, faz o fetch autenticado e armazena.
 * Retorna um blob URL.
 */
export async function getFileAsBlobUrl(serverRelativeUrl, token) {
  const key = cacheKey(serverRelativeUrl);
  const cache = await caches.open(CACHE_NAME);

  // 1. Tenta o cache primeiro
  const cached = await cache.match(key);
  if (cached) {
    const blob = await cached.blob();
    return URL.createObjectURL(blob);
  }

  // 2. Busca autenticada
  const apiUrl = `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/getFileByServerRelativeUrl('${encodeURIComponent(serverRelativeUrl)}')/$value`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json;odata=verbose'
    }
  });

  if (!response.ok) throw new Error(`Erro ${response.status}`);

  // 3. Clona e armazena — precisa clonar porque response.body é consumido
  const blob = await response.clone().blob();

  // Cria um Response "limpo" (sem headers de auth) para o cache
  const cacheResponse = new Response(blob, {
    status: 200,
    headers: {
      'Content-Type': blob.type || 'application/octet-stream',
      'X-Cached-At': new Date().toISOString()
    }
  });

  await cache.put(key, cacheResponse);

  return URL.createObjectURL(blob);
}

/**
 * Verifica se um arquivo já está em cache (útil para ícones offline)
 */
export async function isFileCached(serverRelativeUrl) {
  const cache = await caches.open(CACHE_NAME);
  const match = await cache.match(cacheKey(serverRelativeUrl));
  return !!match;
}

/**
 * Remove um arquivo específico do cache
 */
export async function evictFile(serverRelativeUrl) {
  const cache = await caches.open(CACHE_NAME);
  await cache.delete(cacheKey(serverRelativeUrl));
}
