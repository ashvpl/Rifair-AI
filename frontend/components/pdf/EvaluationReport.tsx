import { Document, Page, View, Text } from '@react-pdf/renderer';
import { RifairLogo } from './RifairLogo';
import { styles, colors, type, spacing } from '@/lib/pdf/design-system';
import { CandidateEvaluationData } from '@/lib/pdf/types';

export const EvaluationReport = ({ data, logoSrc }: { data: CandidateEvaluationData & { candidate_name?: string, questions?: string[], notes?: string[] }, logoSrc?: string }) => {
  const rec = data.recommendation || 'HOLD';
  const recColor = rec === 'HIRE' ? colors.success : rec === 'HOLD' ? colors.warning : colors.danger;
  const recBg = rec === 'HIRE' ? colors.successBg : rec === 'HOLD' ? colors.warningBg : colors.dangerBg;

  return (
    <Document>
      <Page size="A4" style={[styles.page, { backgroundColor: colors.blueBg }]}>
        <View style={styles.header}>
          <View>
            <Text style={{ ...type.display, color: colors.blue }}>Evaluation Report</Text>
            <Text style={{ ...type.caption, marginTop: spacing.xs }}>
              {data.candidate_name || 'Candidate'} • {new Date(data.created_at).toLocaleDateString('en-IN')}
            </Text>
          </View>
          <RifairLogo width={100} src={logoSrc} />
        </View>

        {/* Recommendation banner */}
        <View style={{ 
          flexDirection: 'row', alignItems: 'center', gap: spacing.xl,
          padding: spacing.xl, backgroundColor: recBg, borderRadius: spacing.md, marginBottom: spacing.xl 
        }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ 
              width: 64, height: 64, borderRadius: 32, backgroundColor: recColor,
              alignItems: 'center', justifyContent: 'center' 
            }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{data.overall_score || 0}</Text>
            </View>
            <Text style={{ ...type.caption, marginTop: spacing.xs }}>SCORE</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 32, fontWeight: 700, color: recColor }}>{rec}</Text>
            <Text style={type.body}>
              {rec === 'HIRE' ? 'Candidate demonstrates strong alignment with role requirements.' :
               rec === 'HOLD' ? 'Candidate shows potential but has notable gaps to address.' :
               'Candidate does not meet minimum requirements for this role.'}
            </Text>
          </View>
        </View>

        {/* Scoring table */}
        <View style={styles.section}>
          <Text style={type.h2}>Question Scoring</Text>
          <View style={{ marginTop: spacing.md }}>
            {/* Header */}
            <View style={{ 
              flexDirection: 'row', paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
              backgroundColor: colors.cloud, borderBottomWidth: 0.5, borderBottomColor: colors.silver 
            }}>
              <Text style={{ ...type.caption, flex: 2 }}>Question</Text>
              <Text style={{ ...type.caption, flex: 0.5, textAlign: 'center' }}>Score</Text>
              <Text style={{ ...type.caption, flex: 2 }}>Notes</Text>
            </View>
            {/* Rows */}
            {(data.scores || []).map((score: any, i: number) => (
              <View key={i} style={{ 
                flexDirection: 'row', paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
                borderBottomWidth: 0.5, borderBottomColor: colors.cloud, alignItems: 'flex-start' 
              }} wrap={false}>
                <Text style={{ ...type.bodySmall, flex: 2, paddingRight: spacing.sm }}>
                  {(data.questions?.[i] || '').substring(0, 60)}...
                </Text>
                <Text style={{ 
                  ...type.bodySmall, flex: 0.5, textAlign: 'center', fontWeight: 700,
                  color: score >= 4 ? colors.success : score >= 3 ? colors.warning : colors.danger 
                }}>
                  {score}/5
                </Text>
                <Text style={{ ...type.bodySmall, flex: 2, color: colors.slate }}>
                  {data.notes?.[i] || '—'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Strengths & Gaps */}
        <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl }}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...type.h2, color: colors.success }}>Strengths</Text>
            {(data.strengths || []).map((s: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <Text style={{ color: colors.success }}>✓</Text>
                <Text style={type.bodySmall}>{typeof s === 'string' ? s : (s.observation || s.text || '')}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...type.h2, color: colors.danger }}>Gaps</Text>
            {(data.gaps || []).map((gap: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <Text style={{ color: colors.danger }}>✗</Text>
                <View>
                  <Text style={type.bodySmall}>{typeof gap === 'string' ? gap : (gap.observation || gap.text || '')}</Text>
                  {typeof gap === 'object' && gap.severity && (
                    <Text style={{ ...type.caption, fontSize: 7, marginTop: 2 }}>Severity: {gap.severity}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Confidential • rifair.ai</Text>
          <Text style={styles.footerText}>{data.candidate_name || 'Candidate'} Evaluation</Text>
          <Text style={styles.footerText}>Page 1</Text>
        </View>
      </Page>
    </Document>
  );
};
