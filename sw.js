// Based on: https://adactio.com/journal/13540
//         https://gist.github.com/adactio/3717b7da007a9363ddf21f584aae34af/revisions
// Original license:
// Licensed under a CC0 1.0 Universal (CC0 1.0) Public Domain Dedication
// http://creativecommons.org/publicdomain/zero/1.0/

const cacheName = 'files';

addEventListener('fetch',  fetchEvent => {
  const request = fetchEvent.request;
  if (request.method !== 'GET') {
    return;
  }
  fetchEvent.respondWith(async function() {
    const responseFromFetch = fetch(request);
    fetchEvent.waitUntil(async function() {
      const responseCopy = (await responseFromFetch).clone();
      const myCache = await caches.open(cacheName);
      await myCache.put(request, responseCopy);
    }());
      const responseFromCache = await caches.match(request);
      return responseFromCache || responseFromFetch;
  }());
});
