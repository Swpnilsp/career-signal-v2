import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();

    // Basic HTML parser using regex to extract text content
    // Remove scripts, styles, and comments
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');

    // Convert common block tags to newlines
    cleanText = cleanText
      .replace(/<\/p>|<\/div>|<\/h1>|<\/h2>|<\/h3>|<\/h4>|<\/h5>|<\/h6>|<\/li>|<\/tr>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n');

    // Strip remaining tags
    cleanText = cleanText.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    cleanText = cleanText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean up multiple spaces and empty lines
    const lines = cleanText
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        const lower = line.toLowerCase();
        if (lower.length < 5) return false;
        // Filter out boilerplate common header/footer strings to clean up description
        if (lower.includes('javascript') && lower.includes('enable')) return false;
        if (lower.includes('cookie policy') || lower.includes('privacy policy')) return false;
        if (lower.includes('all rights reserved')) return false;
        return true;
      });

    const textContent = lines.join('\n');
    return NextResponse.json({ text: textContent.slice(0, 10000) });
  } catch (error: any) {
    console.error('Error fetching job link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract job description.' },
      { status: 500 },
    );
  }
}
