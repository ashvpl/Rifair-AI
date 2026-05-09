import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '@/lib/pdf/styles';

export const ScoreCircle = ({ score, label = 'Bias Score' }: { score: number; label?: string }) => {
  const color = score > 70 ? colors.danger : score > 40 ? colors.warning : colors.success;
  
  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <View style={[styles.scoreBadge, { backgroundColor: color }]}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
      <Text style={[styles.scoreLabel, { color: colors.textMuted, marginTop: 8 }]}>{label}</Text>
      <Text style={{ fontSize: 10, color, fontWeight: 600, marginTop: 4 }}>
        {score > 70 ? 'High Risk' : score > 40 ? 'Moderate Risk' : 'Low Risk'}
      </Text>
    </View>
  );
};
