import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '@/lib/pdf/styles';

export const PDFHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={{ marginBottom: 24 }}>
    <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 8 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.h1}>{title}</Text>
        {subtitle && <Text style={[styles.body, { color: colors.textLight, marginTop: 2 }]}>{subtitle}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end', marginLeft: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <View style={{ width: 12, height: 12, backgroundColor: colors.accent, borderRadius: 3, marginRight: 4 }} />
          <Text style={{ fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 700, color: colors.primary, letterSpacing: -0.5 }}>
            rifair
          </Text>
          <Text style={{ fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 300, color: colors.accent }}>
            .ai
          </Text>
        </View>
        <Text style={{ fontSize: 7, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Advanced Hiring Intelligence
        </Text>
      </View>
    </View>
    <View style={{ height: 1.5, backgroundColor: colors.primary, opacity: 0.1, marginTop: 4 }} />
  </View>
);
