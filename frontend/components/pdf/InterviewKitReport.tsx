import { Document, Page, View, Text } from '@react-pdf/renderer';
import { RifairLogo } from './RifairLogo';
import { styles, colors, type, spacing } from '@/lib/pdf/design-system';

export const InterviewKitReport = ({ data, logoSrc }: { data: any, logoSrc?: string }) => {
  const questions = data.questions || [];
  const role = data.role || 'Role';
  const experience = data.experience || 'N/A';
  
  // 4 questions per page max
  const pages = [];
  for (let i = 0; i < questions.length; i += 4) {
    pages.push(questions.slice(i, i + 4));
  }

  return (
    <Document>
      {/* COVER */}
      <Page size="A4" style={[styles.page, { backgroundColor: colors.greenBg }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <RifairLogo width={160} src={logoSrc} />
          <Text style={{ ...type.display, marginTop: spacing['3xl'], textAlign: 'center', color: colors.green }}>
            Interview Kit
          </Text>
          <Text style={{ ...type.h1, color: colors.slate, marginTop: spacing.sm, textAlign: 'center' }}>
            {role}
          </Text>
          <Text style={{ ...type.body, marginTop: spacing.md, textAlign: 'center' }}>
            {experience} years experience • {data.company_type || 'Company'} • {data.industry || 'Industry'}
          </Text>
          
          <View style={{ 
            flexDirection: 'row', gap: spacing.xl, marginTop: spacing['3xl'],
            padding: spacing.xl, backgroundColor: colors.cloud, borderRadius: spacing.md 
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...type.display, fontSize: 32 }}>{questions.length}</Text>
              <Text style={type.caption}>Questions</Text>
            </View>
            <View style={{ width: 0.5, backgroundColor: colors.silver }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...type.display, fontSize: 32 }}>{questions.length * 8}</Text>
              <Text style={type.caption}>Minutes</Text>
            </View>
            <View style={{ width: 0.5, backgroundColor: colors.silver }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...type.display, fontSize: 32, color: colors.success }}>0</Text>
              <Text style={type.caption}>Bias Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Confidential • rifair.ai</Text>
          <Text style={styles.footerText}>{role} Interview Kit</Text>
          <Text style={styles.footerText}>Cover</Text>
        </View>
      </Page>

      {/* QUESTION PAGES */}
      {pages.map((pageQuestions, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={{ ...type.h1, fontSize: 16 }}>{role} — Questions {pageIndex * 4 + 1}-{Math.min((pageIndex + 1) * 4, questions.length)}</Text>
            </View>
            <RifairLogo width={80} src={logoSrc} />
          </View>

          {pageQuestions.map((q: any, i: number) => {
            const globalIndex = pageIndex * 4 + i;
            const tagColors: Record<string, any> = {
              technical: { bg: '#dbeafe', text: '#1e40af' },
              behavioral: { bg: '#f3e8ff', text: '#7c3aed' },
              situational: { bg: '#fef3c7', text: '#92400e' },
              leadership: { bg: '#d1fae5', text: '#065f46' },
            };
            const tc = tagColors[q.type?.toLowerCase()] || tagColors.behavioral;

            return (
              <View key={globalIndex} style={{ marginBottom: spacing.lg }}>
                {/* Question header */}
                <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                  <View style={{ 
                    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.forest,
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                  }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{globalIndex + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...type.body, color: colors.ink, fontWeight: 600, fontSize: 11, lineHeight: 1.5 }}>
                      {q.question}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                      <Text style={{ 
                        fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3,
                        backgroundColor: tc.bg, color: tc.text 
                      }}>
                        {q.type}
                      </Text>
                      <Text style={{ ...type.caption, fontSize: 7 }}>{q.competency}</Text>
                      <Text style={{ ...type.caption, fontSize: 7 }}>• {q.estimatedTime || '8 min'}</Text>
                    </View>
                  </View>
                </View>

                {/* Metadata — compact, indented */}
                {q.whyAsked && (
                  <View style={{ marginLeft: 40, marginTop: spacing.sm, padding: spacing.sm, backgroundColor: colors.cloud, borderRadius: 4 }}>
                    <Text style={{ ...type.caption, fontSize: 7, marginBottom: spacing.xs }}>Why This Question</Text>
                    <Text style={{ ...type.bodySmall, color: colors.ink }}>{q.whyAsked}</Text>
                  </View>
                )}

                {q.strongAnswer && (
                  <View style={{ 
                    marginLeft: 40, marginTop: spacing.sm, padding: spacing.sm,
                    backgroundColor: colors.successBg, borderLeftWidth: 2, borderLeftColor: colors.success, borderRadius: 4 
                  }}>
                    <Text style={{ ...type.caption, fontSize: 7, color: colors.success, marginBottom: spacing.xs }}>Strong Answer</Text>
                    <Text style={{ ...type.bodySmall, color: colors.ink }}>{q.strongAnswer}</Text>
                  </View>
                )}

                {q.redFlags && (
                  <View style={{ 
                    marginLeft: 40, marginTop: spacing.sm, padding: spacing.sm,
                    backgroundColor: colors.dangerBg, borderLeftWidth: 2, borderLeftColor: colors.danger, borderRadius: 4 
                  }}>
                    <Text style={{ ...type.caption, fontSize: 7, color: colors.danger, marginBottom: spacing.xs }}>Red Flags</Text>
                    <Text style={{ ...type.bodySmall, color: colors.ink }}>{q.redFlags}</Text>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Confidential • rifair.ai</Text>
            <Text style={styles.footerText}>{role} Interview Kit</Text>
            <Text style={styles.footerText}>Page {pageIndex + 2}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};
