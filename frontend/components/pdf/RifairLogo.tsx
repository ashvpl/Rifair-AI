import { Svg, Path, Rect, Text, Image, View } from '@react-pdf/renderer';

export const RifairLogo = ({ width = 120, src }: { width?: number, src?: string | undefined }) => {
  const height = width * 0.35;
  
  if (src) {
    return (
      <View style={{ width, height: 'auto' }}>
        <Image src={src} style={{ width: '100%' }} />
      </View>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 240 84">
      {/* Rifair mark — square with rounded corners */}
      <Rect x="4" y="4" width="48" height="48" rx="8" fill="#0a3d2e" />
      <Path d="M16 20 L16 44 M16 20 L28 20 C32 20 34 22 34 26 C34 30 32 32 28 32 L16 32" 
        stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M38 36 L44 44" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round" />
      
      {/* Wordmark */}
      <Text x="64" y="38" style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 32, fill: "#0a3d2e" }}>rifair</Text>
      <Text x="64" y="56" style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 11, fill: "#1D9E75", letterSpacing: 1.5 }}>H I R I N G &nbsp; I N T E L L I G E N C E</Text>
    </Svg>
  );
};
