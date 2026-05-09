// components/TemplateRenderer.tsx
import React from 'react';
import { TemplateRegistry, TemplateDefinition } from '../templates/registry';

interface TemplateRendererProps {
  reportType: string;
  data: any;
  config?: any;
}

// Mock components for demonstration
const StandardHeader = ({ title }: any) => <header className="header">{title}</header>;
const PageFooter = () => <footer className="footer">Rifair AI Report</footer>;
const MinimalCover = ({ data }: any) => <div className="cover"><h1>{data.title}</h1></div>;
const TableOfContents = () => <div className="toc"><h2>Table of Contents</h2></div>;

const COMPONENT_MAP: Record<string, React.FC<any>> = {
  StandardHeader,
  PageFooter,
  MinimalCover,
  TableOfContents,
  // Add others as they are implemented
};

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  reportType,
  data,
  config = {}
}) => {
  const registry = new TemplateRegistry();
  const template = registry.getTemplateForReport(reportType);
  
  const CoverPage = COMPONENT_MAP[template.components.coverPage || 'MinimalCover'] || MinimalCover;
  const Header = COMPONENT_MAP[template.components.header || 'StandardHeader'] || StandardHeader;
  const Footer = COMPONENT_MAP[template.components.footer || 'PageFooter'] || PageFooter;
  const TOC = template.components.tableOfContents ? (COMPONENT_MAP[template.components.tableOfContents] || TableOfContents) : null;
  
  return (
    <>
      <style>{`
        :root {
          --report-title: "${data.title || 'Report'}";
          --report-type: "${reportType}";
        }
      `}</style>

      {/* Cover Page — Always page 1 */}
      <div className="page cover-page">
        <CoverPage data={data} config={config} />
      </div>
      
      {/* Table of Contents — Page 2 if enabled */}
      {TOC && (
        <div className="page toc-page">
          <TOC sections={data.sections || []} />
        </div>
      )}
      
      {/* Content Pages */}
      {(data.sections || []).map((section: any, index: number) => (
        <ContentSection
          key={section.id || index}
          section={section}
          template={template}
          isFirstContentPage={index === 0}
          Header={Header}
          Footer={Footer}
        />
      ))}
      
      {/* Back Page (optional) */}
      <div className="page back-page">
        <Footer variant="back-page" />
      </div>
    </>
  );
};

// Section renderer with intelligent layout
const ContentSection: React.FC<{
  section: any;
  template: TemplateDefinition;
  isFirstContentPage: boolean;
  Header: React.FC<any>;
  Footer: React.FC<any>;
}> = ({ section, template, isFirstContentPage, Header, Footer }) => {
  const layoutType = section.layoutType || (template.layout.columns === 2 ? 'two-column' : 'single-column');
  const gridClass = layoutType === 'two-column' ? 'content-grid' : '';
  
  return (
    <div 
      className={`page content-page layout-${layoutType}`}
      data-section-id={section.id}
    >
      {isFirstContentPage && <Header title={section.title} />}
      
      <div className="section-header">
        <h2>{section.title}</h2>
        {section.subtitle && <p>{section.subtitle}</p>}
      </div>
      
      <div className={`content-body ${gridClass}`}>
        {(section.blocks || []).map((block: any) => (
          <div key={block.id} id={block.id} className={`block ${block.fullWidth ? 'full-width' : ''}`}>
             {/* Render specific block content based on type */}
             {block.type === 'text' && <div className="text-block">{block.content}</div>}
             {block.type === 'table' && (
               <div className="table-container">
                 <table>
                   {block.headers && (
                     <thead>
                       <tr>{block.headers.map((h: string) => <th key={h}>{h}</th>)}</tr>
                     </thead>
                   )}
                   <tbody>
                     {(block.rows || []).map((row: any[], i: number) => (
                       <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
             {/* Chart placeholders */}
             {(block.type === 'chart' || block.type === 'radar' || block.type === 'bar') && (
               <div className="chart-wrapper">
                 <div className="chart-placeholder">Chart: {block.title || block.type}</div>
               </div>
             )}
          </div>
        ))}
      </div>
      
      <Footer />
    </div>
  );
};
