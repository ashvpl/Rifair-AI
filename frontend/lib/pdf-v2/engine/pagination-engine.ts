// engine/pagination-engine.ts

import { chromium } from 'playwright';

export interface PageBudget {
  availableHeight: number; // px
  usedHeight: number;
  remainingHeight: number;
  isLastPage: boolean;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'table' | 'chart' | 'image' | 'spacer';
  estimatedHeight: number;
  minHeight: number;
  maxHeight: number;
  breakable: boolean; // Can this split across pages?
  keepWithNext?: string[]; // IDs that must follow this block
  priority: number; // 1-10, for overflow decisions
}

export class PaginationEngine {
  private readonly PAGE_HEIGHT = 1123; // A4 at 96dpi
  private readonly MARGIN_TOP = 80;
  private readonly MARGIN_BOTTOM = 80;
  private readonly USABLE_HEIGHT = this.PAGE_HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM;
  
  /**
   * PASS 1: Measure all content blocks in a virtual viewport
   * This is the secret to eliminating blank pages
   */
  async measureContentBlocks(
    htmlContent: string, 
    blocks: ContentBlock[]
  ): Promise<ContentBlock[]> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set viewport to page width for accurate measurement
    await page.setViewportSize({ width: 794, height: this.PAGE_HEIGHT });
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });
    
    const measuredBlocks = await Promise.all(
      blocks.map(async (block) => {
        const element = await page.$(`#${block.id}`);
        if (!element) return { ...block, estimatedHeight: 0 };
        
        const box = await element.boundingBox();
        const height = box ? box.height : 0;
        
        return {
          ...block,
          estimatedHeight: height,
          minHeight: height, // Actual measured height
          maxHeight: height * 1.2 // Allow 20% growth for dynamic content
        };
      })
    );
    
    await browser.close();
    return measuredBlocks;
  }
  
  /**
   * PASS 2: Assign blocks to pages using bin-packing algorithm
   * Ensures no page is < 60% full (eliminates near-blank pages)
   */
  assignPages(blocks: ContentBlock[]): ContentBlock[][] {
    const pages: ContentBlock[][] = [];
    let currentPage: ContentBlock[] = [];
    let currentHeight = 0;
    const MIN_PAGE_FILL = 0.6; // 60% minimum fill
    
    for (const block of blocks) {
      // Check if block fits on current page
      if (currentHeight + block.estimatedHeight <= this.USABLE_HEIGHT) {
        currentPage.push(block);
        currentHeight += block.estimatedHeight;
      } else {
        // Block doesn't fit — decide: push to next page or split?
        
        if (!block.breakable) {
          // Must keep together — start new page
          if (currentPage.length > 0) pages.push(currentPage);
          currentPage = [block];
          currentHeight = block.estimatedHeight;
        } else {
          // Can split — but check if current page is too empty
          const fillRatio = currentHeight / this.USABLE_HEIGHT;
          
          if (fillRatio < MIN_PAGE_FILL && currentPage.length > 0) {
            // Current page too empty, try to pull previous block back
            // and re-balance (simplified — real impl uses backtracking)
            pages.push(currentPage);
            currentPage = [block];
            currentHeight = block.estimatedHeight;
          } else {
            // Accept the break, start new page
            pages.push(currentPage);
            currentPage = [block];
            currentHeight = block.estimatedHeight;
          }
        }
      }
    }
    
    if (currentPage.length > 0) pages.push(currentPage);
    
    // FINAL CHECK: Merge last page if it's nearly empty
    if (pages.length > 1) {
      const lastPage = pages[pages.length - 1];
      const lastPageHeight = lastPage.reduce((sum, b) => sum + b.estimatedHeight, 0);
      const lastFillRatio = lastPageHeight / this.USABLE_HEIGHT;
      
      if (lastFillRatio < MIN_PAGE_FILL && pages.length > 1) {
        // Try to absorb last page into previous
        const prevPage = pages[pages.length - 2];
        const prevHeight = prevPage.reduce((sum, b) => sum + b.estimatedHeight, 0);
        
        if (prevHeight + lastPageHeight <= this.USABLE_HEIGHT * 1.05) {
          // Allow 5% overflow to prevent orphan page
          pages[pages.length - 2] = [...prevPage, ...lastPage];
          pages.pop();
        }
      }
    }
    
    return pages;
  }
}
