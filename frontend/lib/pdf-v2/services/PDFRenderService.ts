import { Browser, Page } from 'playwright-core';
import { chromium } from 'playwright-core';
import { TemplateAdapter } from './TemplateAdapter';
import { PDFOptimizer } from '../optimization/PDFOptimizer';
import type { AnyReport } from '../types/report-schemas';

const isProduction = process.env.NODE_ENV === 'production';

export interface RenderOptions {
  templateName: string;
  data: AnyReport;
  quality?: 'draft' | 'standard' | 'premium';
}

export interface RenderResult {
  buffer: Buffer;
  pageCount: number;
  warnings: string[];
}

export class PDFRenderService {
  private browser: Browser | null = null;
  private pagePool: Page[] = [];
  private readonly MAX_POOL_SIZE = 3;
  
  async initialize() {
    if (this.browser) return;

    if (isProduction) {
      // Production (Vercel) uses @sparticuz/chromium
      const chromiumPack = await import('@sparticuz/chromium-min');
      this.browser = await chromium.launch({
        args: chromiumPack.default.args,
        executablePath: await chromiumPack.default.executablePath('https://github.com/sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
        headless: true,
      });
    } else {
      // Local development uses standard playwright
      const playwright = await import('playwright');
      this.browser = await playwright.chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--font-render-hinting=none',
          '--force-color-profile=srgb',
        ]
      });
    }
  }
  
  async render(options: RenderOptions): Promise<RenderResult> {
    await this.initialize();
    
    const page = await this.getPage();
    const warnings: string[] = [];
    
    try {
      // 1. Generate HTML via TemplateAdapter
      const html = TemplateAdapter.render(options.templateName, options.data);
      
      // 2. Set content with strict network waiting
      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: 45000
      });
      
      // 3. Wait for fonts and high-fidelity rendering
      await page.evaluate(() => document.fonts.ready);
      
      // 4. Pre-flight layout validation & auto-fixing
      const layoutReport = await this.validateLayout(page);
      if (!layoutReport.isValid) {
        warnings.push(...layoutReport.warnings);
        await this.autoFixLayout(page, layoutReport.issues);
      }
      
      // 5. Generate PDF with production-grade settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false, 
        scale: 1,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });
      
      // 6. Post-processing optimization (compression, metadata)
      const optimizer = new PDFOptimizer();
      const optimizedBuffer = await optimizer.optimize(Buffer.from(pdfBuffer));
      
      const pageCount = await this.getPageCount(page);

      return {
        buffer: optimizedBuffer,
        pageCount,
        warnings
      };
      
    } catch (error: any) {
      console.error(`[PDFRenderService] Render failed: ${error.message}`);
      throw error;
    } finally {
      await this.releasePage(page);
    }
  }
  
  private async validateLayout(page: Page) {
    return page.evaluate(() => {
      const warnings: string[] = [];
      const issues: any[] = [];
      
      // Check for elements that overflow their container
      const blocks = document.querySelectorAll('.q-card, .jd-section-card, .stat-card, .rec-row');
      blocks.forEach(el => {
        const rect = el.getBoundingClientRect();
        // If block is split across pages in an ugly way, or overflows
        if (rect.height > 800) { // Unusually large block
          warnings.push(`Block ${el.className} is extremely large (${Math.round(rect.height)}px)`);
        }
      });
      
      return {
        isValid: issues.length === 0,
        warnings,
        issues
      };
    });
  }
  
  private async autoFixLayout(page: Page, issues: any[]) {
    // Implement layout repairs if needed (e.g. force page breaks)
    for (const issue of issues) {
      if (issue.type === 'overflow') {
        await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (el) (el as HTMLElement).style.breakBefore = 'page';
        }, issue.id);
      }
    }
  }
  
  private async getPageCount(page: Page): Promise<number> {
    return page.evaluate(() => {
      const height = document.documentElement.scrollHeight;
      const pageHeight = 1122; // approx A4 at 96dpi
      return Math.ceil(height / pageHeight) || 1;
    });
  }
  
  private async getPage(): Promise<Page> {
    if (this.pagePool.length > 0) {
      return this.pagePool.pop()!;
    }
    return this.browser!.newPage({
      viewport: { width: 1200, height: 1600 },
      deviceScaleFactor: 2, // Retina-quality for sharper text/charts
    });
  }
  
  private async releasePage(page: Page) {
    if (this.pagePool.length < this.MAX_POOL_SIZE) {
      await page.goto('about:blank');
      this.pagePool.push(page);
    } else {
      await page.close();
    }
  }
  
  async shutdown() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
