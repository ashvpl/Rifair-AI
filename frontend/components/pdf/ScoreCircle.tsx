import { View, Text } from '@react-pdf/renderer';
import { styles, colors, type, spacing } from '@/lib/pdf/design-system';

export const ScoreCircle = ({ score, label = 'Bias Score' }: { score: number; label?: string }) => {
  const color = score > 70 ? colors.danger : score > 40 ? colors.warning : colors.success;
  
  return (
    <View style={{ alignItems: 'center', marginVertical: spacing.lg }}>
      <View style={[styles.scoreBadge, { backgroundColor: color }]}>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
      <Text style={[styles.scoreLabel, { color: colors.silver, marginTop: spacing.sm }]}>{label}</Text>
      <Text style={{ fontSize: 10, color, fontWeight: 600, marginTop: 4 }}>
        {score > 70 ? 'High Risk' : score > 40 ? 'Moderate Risk' : 'Low Risk'}
      </Text>
    </View>
  );
};
