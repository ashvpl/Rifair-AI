// TemplateAdapter.ts — High-fidelity Handlebars execution layer

import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import type { AnyReport } from '../types/report-schemas';

export class TemplateAdapter {
  private static templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  static {
    // Logic Helpers
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('ne', (a, b) => a !== b);
    Handlebars.registerHelper('lt', (a, b) => a < b);
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('lte', (a, b) => a <= b);
    Handlebars.registerHelper('gte', (a, b) => a >= b);
    Handlebars.registerHelper('and', (a, b) => a && b);
    Handlebars.registerHelper('or', (a, b) => a || b);
    
    // Formatting Helpers
    Handlebars.registerHelper('uppercase', (str) => typeof str === 'string' ? str.toUpperCase() : str);
    Handlebars.registerHelper('lowercase', (str) => typeof str === 'string' ? str.toLowerCase() : str);

    // Iteration Helpers
    Handlebars.registerHelper('chunk', function(items, size, options) {
      if (!items || items.length === 0) return '';
      let result = '';
      for (let i = 0; i < items.length; i += size) {
        result += options.fn({ 
          chunkItems: items.slice(i, i + size), 
          chunkIndex: Math.floor(i / size) + 1,
          isLastChunk: (i + size >= items.length)
        });
      }
      return result;
    });
  }

  /**
   * Renders a report schema to HTML using a Handlebars template.
   */
  static render(templateName: string, data: AnyReport): string {
    const template = this.getTemplate(templateName);
    
    // Read global print master CSS to inject into template
    const cssPath = path.join(process.cwd(), 'lib/pdf-v2/styles/print-master.css');
    const printMasterCss = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

    // Load logo as base64
    const logoPath = path.join(process.cwd(), 'public/rifair-logo.png');
    const logoBase64 = fs.existsSync(logoPath) 
      ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
      : '';

    // Merge data with global helpers/CSS
    const context = {
      ...data,
      printMasterCss,
      logoBase64,
      isProduction: process.env.NODE_ENV === 'production',
      timestamp: new Date().toISOString(),
    };

    return template(context);
  }

  private static getTemplate(name: string): HandlebarsTemplateDelegate {
    if (this.templates.has(name) && process.env.NODE_ENV === 'production') {
      return this.templates.get(name)!;
    }

    const templatePath = path.join(process.cwd(), 'lib/pdf-v2/templates/html', name);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`[TemplateAdapter] Template not found: ${name} at ${templatePath}`);
    }

    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    
    this.templates.set(name, template);
    return template;
  }
}
