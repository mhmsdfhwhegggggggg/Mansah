import { NextResponse, NextRequest } from 'next/server';

// We must support POST and OPTIONS if Shein attempts to POST data 
export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', '*');
  return new NextResponse('OK', { status: 200, headers });
}

async function handleProxy(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  // Ensure valid URL
  if (!targetUrl.startsWith('http')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const sbnOrigin = request.nextUrl.origin;
    const targetOrigin = new URL(targetUrl).origin;

    // Optional: Extract body if POST
    let body = undefined;
    if (request.method === 'POST') {
      body = await request.text();
    }

    const res = await fetch(targetUrl, {
      method: request.method === 'OPTIONS' ? 'GET' : request.method,
      body: body || undefined,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
      },
    });

    // Strip upstream blocking headers globally!
    const headers = new Headers(res.headers);
    headers.delete('x-frame-options');
    headers.delete('content-security-policy');
    headers.delete('strict-transport-security');
    headers.delete('access-control-allow-origin');
    headers.delete('access-control-allow-methods');
    headers.delete('access-control-allow-credentials');
    headers.delete('content-encoding');
    headers.delete('content-length');

    // Force allow CORS globally for OUR iframe and scripts
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');

    const contentType = headers.get('content-type') || '';

    // If it's HTML, we inject our stealth bridge logic
    if (contentType.includes('text/html')) {
      let html = await res.text();

      // Ensure Lazy Loaders default to actual images
      html = html.replace(/data-src="/g, 'src="');
      html = html.replace(/v-lazy="/g, 'src="');
      html = html.replace(/data-original="/g, 'src="');

      const injection = `
       <base href="${targetOrigin}/">
       <style>
         #sbn-floating-btn {
           position: fixed;
           bottom: 30px;
           left: 50%;
           transform: translateX(-50%);
           background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
           color: white;
           padding: 16px 32px;
           border-radius: 50px;
           font-weight: 900;
           font-family: inherit;
           font-size: 18px;
           box-shadow: 0 10px 30px rgba(234, 88, 12, 0.5);
           z-index: 2147483647;
           cursor: pointer;
           border: 3px solid white;
           text-align: center;
           transition: all 0.3s ease;
         }
         #sbn-floating-btn:hover { background: #c2410c; transform: translateX(-50%) scale(1.05); }
       </style>
       <script>
         document.addEventListener('DOMContentLoaded', () => {
           // 1. Add SBN Floating Checkout Button
           const btn = document.createElement('div');
           btn.id = 'sbn-floating-btn';
           btn.innerText = '🛒 اشترِ الآن عبر SBN';
           btn.onclick = () => {
             // We drop the iframe and send the exact URL to the parent window Checkout flow
             window.parent.postMessage({ type: 'SBN_CHECKOUT', url: window.location.href || '${targetUrl}' }, '*');
           };
           document.body.appendChild(btn);

           // 2. Hide Annoying Timeout Modals
           setInterval(() => {
             document.querySelectorAll('div, span, p').forEach(el => {
               const text = el.textContent || '';
               if (text.includes('Access timed out') || text.includes('تحديث الصفحة') || text.includes('timed out')) {
                 const container = el.closest('div[class*="dialog"], div[class*="modal"]');
                 if (container) container.style.display = 'none';
                 el.style.display = 'none';
               }
             });
           }, 1500);

           // 3. Hijack React Router / Vue Router SPA Navigation
           const handleProxyNav = (url) => {
             if (url && !url.includes('javascript:') && !url.startsWith('#')) {
               const absoluteUrl = new URL(url, '${targetOrigin}').href;
               window.location.href = '${sbnOrigin}/api/bridge?url=' + encodeURIComponent(absoluteUrl);
             }
           };

           const originalPush = history.pushState;
           history.pushState = function(state, title, url) {
             handleProxyNav(url);
             return originalPush.apply(this, arguments);
           };

           const originalReplace = history.replaceState;
           history.replaceState = function(state, title, url) {
             handleProxyNav(url);
             return originalReplace.apply(this, arguments);
           };

           // 4. Fallback Intercept <a> clicks
           document.body.addEventListener('click', (e) => {
             const a = e.target.closest('a');
             if (a && a.href) {
               e.preventDefault();
               handleProxyNav(a.getAttribute('href'));
             }
           });

           // 5. Native Fetch/XHR Interceptor to route internal APIs through SBN
           const SBN_PROXY = '${sbnOrigin}/api/bridge?url=';
           
           const originalFetch = window.fetch;
           window.fetch = async function(...args) {
             try {
               let url = args[0];
               if (typeof url === 'string' && !url.includes('/api/bridge')) {
                 const absoluteUrl = new URL(url, '${targetOrigin}').href;
                 if (absoluteUrl.includes('shein.com')) {
                   args[0] = SBN_PROXY + encodeURIComponent(absoluteUrl);
                 }
               } else if (url instanceof Request) {
                 const absoluteUrl = new URL(url.url, '${targetOrigin}').href;
                 if (absoluteUrl.includes('shein.com')) {
                   args[0] = new Request(SBN_PROXY + encodeURIComponent(absoluteUrl), url);
                 }
               }
             } catch (e) {}
             return originalFetch.apply(this, args);
           };

           const originalXHR = XMLHttpRequest.prototype.open;
           XMLHttpRequest.prototype.open = function(method, url, ...rest) {
             try {
               if (typeof url === 'string' && !url.includes('/api/bridge')) {
                 const absoluteUrl = new URL(url, '${targetOrigin}').href;
                 if (absoluteUrl.includes('shein.com')) {
                   url = SBN_PROXY + encodeURIComponent(absoluteUrl);
                 }
               }
             } catch (e) {}
             return originalXHR.call(this, method, url, ...rest);
           };
         });
       </script>
      `;
      
      html = html.replace('<head>', '<head>' + injection);

      return new NextResponse(html, {
        status: res.status,
        headers: headers,
      });
    }

    // Pass JSON, Images, and other assets directly with the open CORS headers
    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: res.status,
      headers: headers,
    });
    
  } catch (error) {
    return new NextResponse('SBN Bridge Failed', { status: 500 });
  }
}
