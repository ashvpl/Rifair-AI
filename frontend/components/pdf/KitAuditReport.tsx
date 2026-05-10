import { Document, Page, View, Text } from '@react-pdf/renderer';
import { RifairLogo } from './RifairLogo';
import { styles, colors, type, spacing } from '@/lib/pdf/design-system';
import { KitAuditData, BiasIssue } from '@/lib/pdf/types';

export const KitAuditReport = ({ data, logoSrc }: { data: KitAuditData, logoSrc?: string }) => {
  if (!data) return null;

  const d = data;
  const issues = Array.isArray(d.issues) ? d.issues : [];
  const score = typeof d.score === 'number' ? d.score : 0;
  const scoreColor = score > 70 ? colors.danger : score > 40 ? colors.warning : colors.success;
  
  const gaps = Array.isArray(d.competency_gaps) ? d.competency_gaps : [];
  const redundancy = Array.isArray(d.redundancy_flags) ? d.redundancy_flags : [];
  const suggestions = Array.isArray(d.suggested_additions) ? d.suggested_additions : [];
  const distribution = (d.type_distribution && typeof d.type_distribution === 'object') ? d.type_distribution : {};

  const resolveText = (val: any) => {
    if (typeof val === 'string') return val;
    if (!val) return '';
    return val.reason || val.text || val.gap || val.observation || val.explanation || val.message || 'Analysis unavailable';
  };

  return (
    <Document>
      {/* PAGE 1: STRATEGIC OVERVIEW */}
      <Page size="A4" style={[styles.page, { backgroundColor: colors.greenBg }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...type.display, fontSize: 24, color: colors.green }}>{String(d.title || 'Kit Audit Report')}</Text>
            <Text style={{ ...type.caption, marginTop: spacing.xs, color: colors.slate }}>
              Professional Audit • {d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
            </Text>
          </View>
          <RifairLogo width={100} src={logoSrc} />
        </View>

        {/* Executive Summary Dashboard */}
        <View style={{ flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.xl, padding: spacing.xl, backgroundColor: colors.cloud, borderRadius: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...type.h2, color: colors.forest, letterSpacing: 0.5 }}>Executive Summary</Text>
            <Text style={{ ...type.body, marginTop: spacing.sm, lineHeight: 1.5 }}>
              This audit analyzes the inclusivity, structural validity, and psychological safety of your interview questions. 
              {score > 50 
                ? 'Critically, we identified systemic bias patterns that may alienate diverse candidate pools. Immediate structural intervention is recommended.' 
                : 'The kit follows most inclusive standards. We have suggested targeted refinements to elevate your hiring brand to industry-leading standards.'}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.snow, borderRadius: 6, borderLeftWidth: 2, borderLeftColor: colors.danger }}>
                <Text style={{ ...type.caption, fontSize: 7, color: colors.ink }}>{issues.length} BIAS FLAGS</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.snow, borderRadius: 6, borderLeftWidth: 2, borderLeftColor: colors.warning }}>
                <Text style={{ ...type.caption, fontSize: 7, color: colors.ink }}>{gaps.length} COMP. GAPS</Text>
              </View>
            </View>
          </View>
          
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: scoreColor, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.snow }}>
              <Text style={{ color: scoreColor, fontSize: 28, fontWeight: 700 }}>{score}</Text>
            </View>
            <Text style={{ ...type.caption, marginTop: spacing.sm, color: scoreColor, fontWeight: 700 }}>
              {score > 70 ? 'CRITICAL RISK' : score > 40 ? 'MODERATE RISK' : 'LOW RISK'}
            </Text>
          </View>
        </View>

        {/* Structural Validity */}
        <View wrap={false}>
          <Text style={{ ...type.h1, fontSize: 16, marginBottom: spacing.md }}>Structural Validity Findings</Text>
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <View style={{ flex: 1, backgroundColor: colors.warningBg, padding: spacing.lg, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.warning }}>
              <Text style={{ ...type.caption, color: colors.warning, marginBottom: spacing.sm, fontSize: 7 }}>Competency Coverage Gaps</Text>
              {gaps.length > 0 ? gaps.map((g: any, i: number) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ ...type.bodySmall, fontWeight: 700, color: colors.ink }}>{g.competency || 'Observation'}</Text>
                  <Text style={{ ...type.bodySmall, fontSize: 8 }}>{resolveText(g)}</Text>
                </View>
              )) : <Text style={type.bodySmall}>Comprehensive competency coverage detected.</Text>}
            </View>
            <View style={{ flex: 1, backgroundColor: colors.dangerBg, padding: spacing.lg, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.danger }}>
              <Text style={{ ...type.caption, color: colors.danger, marginBottom: spacing.sm, fontSize: 7 }}>Redundancy & Psychological Safety</Text>
              {redundancy.length > 0 ? redundancy.map((r: any, i: number) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ ...type.bodySmall, fontWeight: 700, color: colors.ink }}>Overlap Detected</Text>
                  <Text style={{ ...type.bodySmall, fontSize: 8 }}>{resolveText(r)}</Text>
                </View>
              )) : <Text style={type.bodySmall}>Optimal question distinctness and candidate comfort levels.</Text>}
            </View>
          </View>
        </View>

        {/* Portfolio Analysis — Integrated into P1 to save space */}
        <View style={{ marginTop: spacing.xl }} wrap={false}>
          <Text style={{ ...type.h2, marginBottom: spacing.sm }}>Portfolio Distribution Analysis</Text>
          <View style={{ flexDirection: 'row', padding: spacing.xl, backgroundColor: colors.snow, borderTopWidth: 1, borderTopColor: colors.cloud, borderBottomWidth: 1, borderBottomColor: colors.cloud }}>
            {Object.entries(distribution).length > 0 ? Object.entries(distribution).map(([key, val]: [string, any], i, arr) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', borderRightWidth: i === arr.length - 1 ? 0 : 0.5, borderRightColor: colors.cloud }}>
                <Text style={{ ...type.h1, fontSize: 18, color: colors.forest }}>{String(val)}%</Text>
                <Text style={{ ...type.caption, fontSize: 6 }}>{String(key).toUpperCase()}</Text>
              </View>
            )) : <Text style={type.bodySmall}>Distribution metrics unavailable</Text>}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>rifair.ai • Intelligence in Inclusivity</Text>
          <Text style={styles.footerText}>Page 1</Text>
        </View>
      </Page>

      {/* PAGE 2: INCLUSIVITY AUDIT & OPTIMIZATION */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={type.h1}>Inclusivity Audit & Fixes</Text>
          <RifairLogo width={80} src={logoSrc} />
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ ...type.h2, marginBottom: spacing.sm }}>Detailed Bias Findings</Text>
          {issues.length > 0 ? issues.map((issue: any, i: number) => (
            <View key={i} style={{ 
              marginBottom: spacing.sm, padding: spacing.md, borderRadius: 8, 
              backgroundColor: colors.snow, borderLeftWidth: 4, borderLeftColor: colors.danger 
            }} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ ...type.caption, color: colors.danger, fontSize: 7 }}>ISSUE {i + 1} • {String(issue.tag || 'bias').replace(/_/g, ' ')}</Text>
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.dangerBg, borderRadius: 4 }}>
                  <Text style={{ ...type.caption, fontSize: 5, color: colors.danger }}>{issue.severity || 'MODERATE'}</Text>
                </View>
              </View>
              <Text style={{ ...type.bodySmall, color: colors.ink }}>{resolveText(issue)}</Text>
            </View>
          )) : (
            <View style={{ padding: spacing.xl, backgroundColor: colors.successBg, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ ...type.body, color: colors.success }}>Audit Complete: No critical bias patterns detected in the current kit.</Text>
            </View>
          )}
        </View>

        {/* Expert Strategies — Integrated here to prevent empty pages */}
        {suggestions.length > 0 && (
          <View wrap={false} style={{ marginTop: spacing.lg, padding: spacing.lg, backgroundColor: colors.cloud, borderRadius: 12 }}>
            <Text style={{ ...type.h1, fontSize: 16, marginBottom: spacing.md, color: colors.forest }}>Expert Kit Optimizations</Text>
            <View style={{ gap: spacing.sm }}>
              {suggestions.map((s: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.md, backgroundColor: colors.snow, borderRadius: 8, marginBottom: spacing.sm }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...type.bodySmall, fontWeight: 700, color: colors.ink }}>Strategic Enhancement</Text>
                    <Text style={{ ...type.bodySmall, fontSize: 8 }}>{resolveText(s)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>rifair.ai • Analysis & Optimization</Text>
          <Text style={styles.footerText}>Page 2</Text>
        </View>
      </Page>

      {/* PAGE 3: STRATEGIC IMPACT & METHODOLOGY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={type.h1}>Strategic Impact & Appendix</Text>
          <RifairLogo width={80} src={logoSrc} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.xl, marginBottom: spacing['2xl'] }}>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>Psychological Safety</Text>
            <Text style={{ ...type.bodySmall, marginTop: spacing.sm }}>
              High-bias kits trigger "Stereotype Threat" in minority candidates, significantly suppressing their real-world performance. 
              By implementing the fixes in this report, you are creating a neutral cognitive environment where talent is accurately measured.
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>Legal & Brand Protection</Text>
            <Text style={{ ...type.bodySmall, marginTop: spacing.sm }}>
              Exclusionary language in interview kits creates latent legal liability and damages your Employer Value Proposition (EVP). 
              A 0-30 score range indicates your kit is legally defensible and culturally inclusive.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ ...type.h2, color: colors.ink }}>Audit Scoring & Compliance</Text>
          <View style={{ marginTop: spacing.md, gap: spacing.md }}>
            {[
              { label: '0-30: LOW RISK', color: colors.success, desc: 'Indicates high inclusive alignment. Kit is ready for production use.' },
              { label: '31-70: MODERATE RISK', color: colors.warning, desc: 'Potential for exclusionary patterns. Minor refinements highly recommended.' },
              { label: '71-100: CRITICAL RISK', color: colors.danger, desc: 'High probability of systemic bias. Immediate structural overhaul required.' }
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.sm }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: item.color, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ ...type.bodySmall, fontWeight: 700, color: colors.ink }}>{item.label}</Text>
                  <Text style={{ ...type.bodySmall, fontSize: 8 }}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: spacing.xl, padding: spacing.xl, backgroundColor: colors.forest, borderRadius: 12 }}>
          <Text style={{ ...type.h2, color: colors.mint, marginBottom: spacing.xs }}>Recommended Next Steps</Text>
          <Text style={{ ...type.bodySmall, color: colors.snow }}>
            1. Apply the Expert Optimizations listed on Page 2.{"\n"}
            2. Conduct a mock interview with the revised kit to test flow.{"\n"}
            3. Use Rifair's Candidate Evaluation tool to ensure consistent scoring.{"\n"}
            4. Re-audit this kit in 6 months to ensure continued cultural alignment.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>rifair.ai • Intelligence in Inclusivity</Text>
          <Text style={styles.footerText}>Page 3</Text>
        </View>
      </Page>
    </Document>
  );
};
