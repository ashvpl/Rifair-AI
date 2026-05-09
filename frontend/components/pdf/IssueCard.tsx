import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '@/lib/pdf/styles';

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
  const statusStyle = severity === 'high' ? styles.statusDanger : 
                      severity === 'medium' ? styles.statusWarning : styles.statusGood;
  
  return (
    <View style={statusStyle}>
      <View style={[styles.row, { marginBottom: 4 }]}>
        <Text style={{ 
          fontSize: 7, 
          fontWeight: 700, 
          color: severity === 'high' ? colors.danger : severity === 'medium' ? colors.warning : colors.success,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {severity} Severity
        </Text>
        <Text style={{ fontSize: 7, color: colors.textMuted, marginLeft: 6 }}>
          {tag.replace(/_/g, ' ').toUpperCase()}
        </Text>
      </View>
      <Text style={{ fontSize: 9.5, color: colors.text, marginBottom: rewrite ? 6 : 0, lineHeight: 1.3 }}>
        {description}
      </Text>
      {rewrite && (
        <View style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border, opacity: 0.8 }}>
          <Text style={{ fontSize: 7, color: colors.textMuted, marginBottom: 2 }}>SUGGESTED REWRITE</Text>
          <Text style={{ fontSize: 9.5, color: colors.primary, fontStyle: 'italic' }}>{rewrite}</Text>
        </View>
      )}
    </View>
  );
};
