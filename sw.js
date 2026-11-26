const CACHE_NAME = 'phonics-kids-cache-v18';
const AUDIO_CACHE_NAME = 'phonics-v2-audio-v1';
const MAX_AUDIO_ENTRIES = 200;
const MAX_AUDIO_BYTES = 30 * 1024 * 1024; // 30MB（移动端更保守，避免占满配额）


const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './audio-credits.html',
    './classic.html',
    './css/kids.css?v=17',
    './js/kids-core.js?v=15',
    './js/kids-audio.js?v=18',
    './js/kids.js?v=17',
    './data/kids-lessons.json?v=15',
    './icons/explorer-penguin.webp',
    './icons/adventure-map.jpg',
    './css/style.css?v=14',
    './js/app.js?v=14',
    './js/audio-loader.js?v=14',
    './js/data-loader.js?v=14',

    './data/rules-master.json',
    ...['b', 'c', 'm', 'p', 's', 't', 'a', 'e', 'i', 'o', 'u', 'sh', 'ch', 'ng', 'th', 'wh', 'a_e', 'i_e', 'o_e', 'u_e', 'u_e_oo'].map(name => './audio/phonemes/' + name + '.mp3'),
    ...'back bag bat bath bed big bug cake can cap cat chin chip chop cube cup duck fin fish game hen home hot jet kick king kite lip long lot map mask math mess mix mop mud mule neck nose pan pen pig pot red rich ring sad ship shop sing sip sit sock sun ten thin thumb tip top tub tube when which whip wish'.split(' ').map(name => './audio/words/' + name + '.mp3'),
    ...'bike hope late name nine rope time tune what'.split(' ').map(name => './audio/words/' + name + '.wav')
];

// 安装阶段：预缓存核心资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).then(() => self.skipWaiting())
    );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            const keep = new Set([
                CACHE_NAME,
                AUDIO_CACHE_NAME
            ]);
            return Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)));
        }).then(() => self.clients.claim())
    );
});

async function trimCache(cacheName, maxEntries, maxBytes) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    const shouldTrimByEntries = typeof maxEntries === 'number' && maxEntries >= 0;
    const shouldTrimByBytes = typeof maxBytes === 'number' && maxBytes > 0;

    if (!shouldTrimByEntries && !shouldTrimByBytes) return;

    let totalBytes = 0;
    if (shouldTrimByBytes) {
        for (const req of keys) {
            const res = await cache.match(req);
            const len = res ? parseInt(res.headers.get('content-length') || '0', 10) : 0;
            totalBytes += Number.isFinite(len) ? len : 0;
        }
    }

    for (const req of keys) {
        const tooManyEntries = shouldTrimByEntries && (await cache.keys()).length > maxEntries;
        const tooManyBytes = shouldTrimByBytes && totalBytes > maxBytes;
        if (!tooManyEntries && !tooManyBytes) break;

        const res = await cache.match(req);
        const len = res ? parseInt(res.headers.get('content-length') || '0', 10) : 0;
        if (Number.isFinite(len)) totalBytes -= len;
        await cache.delete(req);
    }
}


// 请求拦截：缓存优先策略（针对资源），音频单独缓存并限量
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // 避免缓存 Range 请求（音频在移动端经常走分段请求，缓存会造成异常/膨胀）
    if (event.request.headers.has('range')) {
        event.respondWith(fetch(event.request));
        return;
    }

    const url = new URL(event.request.url);
    const isSameOrigin = url.origin === self.location.origin;
    if (!isSameOrigin) return;


    // 音频：单独缓存，避免挤占核心资源缓存，并限制条目数量
    if (isSameOrigin && url.pathname.startsWith('/audio/')) {
        event.respondWith(
            (async () => {
                const audioCache = await caches.open(AUDIO_CACHE_NAME);
                const cached = await audioCache.match(event.request);
                if (cached) return cached;

                const response = await fetch(event.request);
                if (response.ok) {
                    audioCache.put(event.request, response.clone());
                    trimCache(AUDIO_CACHE_NAME, MAX_AUDIO_ENTRIES, MAX_AUDIO_BYTES);
                }
                return response;
            })()
        );
        return;
    }

    // 页面导航优先从网络取新版，断网时使用已缓存入口。
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const response = await fetch(event.request);
                if (response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(event.request, response.clone());
                }
                return response;
            } catch {
                return (await caches.match(event.request)) || (await caches.match('./index.html'));
            }
        })());
        return;
    }

    // 其他静态资源：核心缓存优先
    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;

            const response = await fetch(event.request);
            if (!response.ok) return response;

            // 只缓存同源静态资源（避免跨域缓存导致 install/fetch 不稳定）
            if (isSameOrigin && (url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/') || url.pathname.startsWith('/data/') || url.pathname.startsWith('/fonts/'))) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, response.clone());
            }

            return response;
        })()
    );
});
