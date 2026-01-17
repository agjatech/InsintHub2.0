import { type Tool, type ToolResult } from "@shared/schema";
import * as cheerio from "cheerio";

export async function executeTool(tool: Tool, query: string): Promise<ToolResult> {
  const method = tool.method.toLowerCase();
  
  // For web tools, we'll try to fetch and scrape if they are known scrapable targets
  // otherwise we still return the URL for reference
  if (method === 'api') {
    return runApi(tool, query);
  } else if (method === 'web') {
    return runWebScraper(tool, query);
  } else {
    return {
      toolName: tool.name,
      status: 'unsupported',
      error: `Method ${method} not supported`,
      method: 'api' // Default
    };
  }
}

async function runApi(tool: Tool, query: string): Promise<ToolResult> {
  const url = tool.url.replace('<query>', encodeURIComponent(query));
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(id);

    if (!response.ok) {
      return {
        toolName: tool.name,
        status: 'error',
        error: `HTTP Error: ${response.status} ${response.statusText}`,
        method: 'api',
        executionTime: Date.now() - startTime
      };
    }

    const data = await response.json();
    
    return {
      toolName: tool.name,
      status: 'success',
      data: data,
      method: 'api',
      executionTime: Date.now() - startTime
    };

  } catch (error: any) {
    return {
      toolName: tool.name,
      status: 'error',
      error: error.message || String(error),
      method: 'api',
      executionTime: Date.now() - startTime
    };
  }
}

async function runWebScraper(tool: Tool, query: string): Promise<ToolResult> {
  const url = tool.url.replace('<query>', encodeURIComponent(query));
  const startTime = Date.now();

  try {
    // Attempt to fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    let scrapedData: any = { url };

    // Simple generic scrapers for specific sites
    if (url.includes('github.com')) {
      scrapedData.title = $('title').text().trim();
      scrapedData.bio = $('.p-note.user-profile-bio').text().trim();
      scrapedData.location = $('.p-label[itemprop="homeLocation"]').text().trim();
      scrapedData.followers = $('.Link--secondary:contains("followers") .text-bold').text().trim();
      scrapedData.following = $('.Link--secondary:contains("following") .text-bold').text().trim();
    } else if (url.includes('crt.sh')) {
      const rows: any[] = [];
      $('table tr').each((i, el) => {
        if (i === 0) return;
        const cols = $(el).find('td');
        if (cols.length > 0) {
          rows.push({
            id: $(cols[0]).text().trim(),
            loggedAt: $(cols[1]).text().trim(),
            notBefore: $(cols[2]).text().trim(),
            commonName: $(cols[4]).text().trim(),
          });
        }
      });
      scrapedData.certificates = rows.slice(0, 10);
    } else if (url.includes('who.is')) {
      scrapedData.raw = $('.query_results_container').text().trim().slice(0, 1000);
    } else if (url.includes('google.com/search')) {
      const results: any[] = [];
      $('.g').each((i, el) => {
        const title = $(el).find('h3').text();
        const link = $(el).find('a').attr('href');
        const snippet = $(el).find('.VwiC3b').text();
        if (title) results.push({ title, link, snippet });
      });
      scrapedData.results = results.slice(0, 5);
    } else if (url.includes('hunter.io')) {
      scrapedData.info = $('.search-results').text().trim() || "No public data found without API key.";
    } else {
      // Fallback: just get page title and some meta
      scrapedData.pageTitle = $('title').text().trim();
      scrapedData.description = $('meta[name="description"]').attr('content');
    }

    return {
      toolName: tool.name,
      status: 'success',
      data: scrapedData,
      method: 'web',
      executionTime: Date.now() - startTime
    };
  } catch (error: any) {
    // If scraping fails, still return the URL so they can at least click it
    return {
      toolName: tool.name,
      status: 'success',
      data: { url, note: "Scraping failed, displaying direct link." },
      method: 'web',
      executionTime: Date.now() - startTime
    };
  }
}

