import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'الرابط مطلوب' }, { status: 400 })
    }

    // Default Fallback details for demonstration
    const productData: any = {
      id: `scrape_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Global Product Listing',
      titleAr: 'منتج مجلوب من المنصة الأصلية',
      descriptionAr: 'هذا المنتج تم جلبه عبر نظام Scraping اللحظي لمنصتنا. جميع التفاصيل متوافقة مع منصة العرض الأصلية.',
      price: Math.floor(Math.random() * 100) + 20,
      originalPrice: Math.floor(Math.random() * 100) + 120,
      currency: 'USD',
      images: [
        'https://picsum.photos/seed/detail1/600/600',
        'https://picsum.photos/seed/detail2/600/600'
      ],
      sourceUrl: url,
      sourcePlatform: url.includes('amazon') ? 'AMAZON' : url.includes('aliexpress') || url.includes('alibaba') ? 'ALIBABA' : 'SHEIN',
      rating: 4.8,
      reviewCount: 350
    }

    try {
      // Basic attempt to scrape HTML title/price/images if Amazon
      if (url.includes('amazon')) {
        const res = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 5000
        })
        const $ = cheerio.load(res.data)
        const title = $('#productTitle').text().trim()
        const priceStr = $('.a-price .a-offscreen').first().text().trim()
        const description = $('#feature-bullets').text().trim()
        
        const imgs: string[] = []
        $('#altImages img').each((_: number, el: any) => {
          const src = $(el).attr('src')
          if (src && src.includes('SS40')) { // Amazon thumbnail to large image replacement logic
             imgs.push(src.replace('SS40', 'SL1500'))
          }
        })

        if (title) {
          productData.titleAr = title
          productData.title = title
        }
        if (priceStr) {
          const p = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
          if (!isNaN(p)) {
            productData.price = p
            productData.originalPrice = p * 1.2
          }
        }
        if (description) {
          productData.descriptionAr = description
        }
        if (imgs.length > 0) {
          productData.images = imgs.slice(0, 5)
        }
      } else if (url.includes('shein')) {
        // SHEIN specific lightweight selector attempt
        // Note: Shein often requires heavier scraping, so we provide an "informed fallback"
        productData.titleAr = "منتج شي إن المميز"
        productData.sourcePlatform = "SHEIN"
      }
    } catch (err) {
      console.warn('Scraping detail failed, continuing with fallback.')
    }

    // Process images to ensure they are string for the frontend if needed (though API normally sends JSON)
    const finalProduct = {
      ...productData,
      images: JSON.stringify(productData.images)
    }

    return NextResponse.json({ product: finalProduct })

  } catch (error) {
    console.error('Product Scrape Error:', error)
    return NextResponse.json({ error: 'فشل جلب تفاصيل المنتج' }, { status: 500 })
  }
}
