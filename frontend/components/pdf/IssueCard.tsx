import { View, Text } from '@react-pdf/renderer';
import { styles, colors, type, spacing } from '@/lib/pdf/design-system';

export const IssueCard = ({ 
  severity, 
  tag, 
  description, 
  rewrite 
}: { 
  severity: 'low' | 'medium' | 'high';
  tag: string;
  description: string;
  rewrite?: string;
}) => {
  const isHigh = severity === 'high';
  const isMedium = severity === 'medium';
  
  const scoreColor = isHigh ? colors.danger : isMedium ? colors.warning : colors.success;
  const scoreBg = isHigh ? colors.dangerBg : isMedium ? colors.warningBg : colors.successBg;
  
  return (
    <View style={{
      marginBottom: spacing.md,
      padding: spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: scoreColor,
      backgroundColor: scoreBg,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ 
          fontSize: 7, 
          fontWeight: 700, 
          color: scoreColor,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {severity} Severity
        </Text>
        <Text style={{ fontSize: 7, color: colors.silver, marginLeft: 6 }}>
          {tag.replace(/_/g, ' ').toUpperCase()}
        </Text>
      </View>
      <Text style={{ ...type.bodySmall, color: colors.ink, marginBottom: rewrite ? 6 : 0 }}>
        {description}
      </Text>
      {rewrite && (
        <View style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: colors.silver, opacity: 0.8 }}>
          <Text style={{ ...type.caption, fontSize: 7, marginBottom: 2 }}>SUGGESTED REWRITE</Text>
          <Text style={{ ...type.bodySmall, color: colors.mint, fontStyle: 'italic' }}>{rewrite}</Text>
        </View>
      )}
    </View>
  );
};
