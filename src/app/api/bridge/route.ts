import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  // Ensure valid URL
  if (!targetUrl.startsWith('http')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
      },
    });

    const contentType = res.headers.get('content-type') || '';
    
    // Only rewrite HTML
    if (contentType.includes('text/html')) {
      let html = await res.text();
      const targetOrigin = new URL(targetUrl).origin;
      const sbnOrigin = new URL(request.url).origin;

      // The Magic Injector
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
           z-index: 2147483647; /* absolute max */
           cursor: pointer;
           border: 3px solid white;
           text-align: center;
           transition: all 0.3s ease;
         }
         #sbn-floating-btn:hover { background: #c2410c; transform: translateX(-50%) scale(1.05); }
       </style>
       <script>
         document.addEventListener('DOMContentLoaded', () => {
           // 1. Inject SBN Fast-Checkout Button
           const btn = document.createElement('div');
           btn.id = 'sbn-floating-btn';
           btn.innerText = '🛒 اشترِ الآن عبر SBN';
           btn.onclick = () => {
             // Notify the parent SBN platform with the current URL
             window.parent.postMessage({ type: 'SBN_CHECKOUT', url: window.location.href || '${targetUrl}' }, '*');
           };
           document.body.appendChild(btn);

           // 2. Intercept Navigation to keep them inside SBN completely
           document.body.addEventListener('click', (e) => {
             const a = e.target.closest('a');
             if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
               e.preventDefault();
               const nextUrl = new URL(a.getAttribute('href'), '${targetOrigin}').href;
               window.location.href = '${sbnOrigin}/api/bridge?url=' + encodeURIComponent(nextUrl);
             }
           });

           // 3. Silently KILL Shein CORS Timeout Modals
           setInterval(() => {
             const elements = document.querySelectorAll('div, span, p');
             elements.forEach(el => {
               const text = el.textContent || '';
               if (text.includes('Access timed out') || text.includes('تحديث الصفحة') || text.includes('timed out')) {
                 const container = el.closest('div[class*="dialog"], div[class*="modal"], div[style*="fixed"]');
                 if (container) container.style.display = 'none';
                 el.style.display = 'none';
               }
             });
           }, 1000);
         });
       </script>
      `;
      
      html = html.replace('<head>', '<head>' + injection);

      const headers = new Headers(res.headers);
      // Strip Blocking Headers
      headers.delete('x-frame-options');
      headers.delete('content-security-policy');
      headers.delete('strict-transport-security');
      headers.delete('content-encoding');
      headers.delete('content-length');
      headers.set('Access-Control-Allow-Origin', '*');

      return new NextResponse(html, {
        status: res.status,
        headers: headers,
      });
    }

    // Pass non-HTML assets directly (if they accidentally hit this proxy)
    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: res.status,
      headers: res.headers,
    });
    
  } catch (error) {
    return new NextResponse('SBN Bridge Failed Context', { status: 500 });
  }
}
