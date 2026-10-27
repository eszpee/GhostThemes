// RSS -> JSON proxy for the peterszasz.com homepage blocks.
// Response shape: {status, items: [{title, link, description, pubDate}]}.

const FEEDS = [
    'https://leadtime.tech/feed',
    'https://www.the-retrospective.com/rss/',
];

const ALLOWED_ORIGINS = [
    'https://peterszasz.com',
    'https://www.peterszasz.com',
];

const CACHE_SECONDS = 900;
const MAX_ITEMS = 10;

const ENTITIES = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '};

function decodeEntities(text) {
    return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
        if (code[0] === '#') {
            const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
            return Number.isFinite(n) ? String.fromCodePoint(n) : match;
        }
        return ENTITIES[code.toLowerCase()] ?? match;
    });
}

// The theme inserts these values with innerHTML, so everything leaves here as escaped plain text.
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const TAGS = {
    title: /<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i,
    link: /<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i,
    description: /<description(?:\s[^>]*)?>([\s\S]*?)<\/description>/i,
    pubDate: /<pubDate(?:\s[^>]*)?>([\s\S]*?)<\/pubDate>/i,
};

function tag(xml, name) {
    const match = xml.match(TAGS[name]);
    if (!match) return '';
    const cdata = match[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
    return cdata ? cdata[1] : decodeEntities(match[1]);
}

function toText(html) {
    const stripped = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, '')
        .replace(/<[^>]*>/g, ' ');
    return decodeEntities(stripped).replace(/\s+/g, ' ').trim();
}

function safeLink(url) {
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : '#';
}

export function parseRss(xml) {
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, MAX_ITEMS).map(([, item]) => ({
        title: escapeHtml(toText(tag(item, 'title'))),
        link: escapeHtml(safeLink(toText(tag(item, 'link')))),
        description: escapeHtml(toText(tag(item, 'description'))),
        pubDate: escapeHtml(toText(tag(item, 'pubDate'))),
    }));
    return {status: 'ok', items};
}

function isAllowedOrigin(origin) {
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    try {
        const url = new URL(origin);
        return url.protocol === 'http:' && url.hostname === 'localhost' && url.origin === origin;
    } catch {
        return false;
    }
}

function json(body, status, origin) {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
        'Vary': 'Origin',
    };
    if (isAllowedOrigin(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }
    return new Response(JSON.stringify(body), {status, headers});
}

export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get('Origin') || '';
        if (request.method === 'OPTIONS') {
            return new Response(null, {status: 204, headers: isAllowedOrigin(origin) ? {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Max-Age': '86400',
                'Vary': 'Origin',
            } : {}});
        }
        if (request.method !== 'GET') {
            return json({status: 'error', message: 'Method not allowed'}, 405, origin);
        }

        // Only ever fetch our own constants, never the requested string itself.
        const requested = new URL(request.url).searchParams.get('rss_url');
        const feedUrl = FEEDS.find(feed => feed === requested);
        if (!feedUrl) {
            return json({status: 'error', message: 'Unknown feed'}, 400, origin);
        }

        const cache = caches.default;
        const cacheKey = new Request(`https://rss-proxy.cache/${encodeURIComponent(feedUrl)}`);
        let body = await cache.match(cacheKey).then(hit => hit && hit.json());

        if (!body) {
            const upstream = await fetch(feedUrl, {headers: {'User-Agent': 'peterszasz.com rss-proxy'}});
            if (!upstream.ok) {
                return json({status: 'error', message: `Feed returned ${upstream.status}`}, 502, origin);
            }
            body = parseRss(await upstream.text());
            ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(body), {
                headers: {'Cache-Control': `public, max-age=${CACHE_SECONDS}`},
            })));
        }

        return json(body, 200, origin);
    },
};
