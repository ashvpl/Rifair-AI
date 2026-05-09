import { Font } from '@react-pdf/renderer';

// Register Inter font variants
// Using fresh WOFF URLs as old v18 links are returning 404
Font.register({
  family: 'Inter',
  fonts: [
    // Normal 400
    {
      src: 'https://fonts.gstatic.com/l/font?kit=UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjg&skey=c491285d6722e4fa&v=v20',
      fontWeight: 400,
    },
    // Italic 400
    {
      src: 'https://fonts.gstatic.com/l/font?kit=UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTc2dtRipWD&skey=e5dfd0c3910c7ec9&v=v20',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    // Normal 600
    {
      src: 'https://fonts.gstatic.com/l/font?kit=UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjg&skey=c491285d6722e4fa&v=v20',
      fontWeight: 600,
    },
    // Italic 600
    {
      src: 'https://fonts.gstatic.com/l/font?kit=UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTcB9xRipWD&skey=e5dfd0c3910c7ec9&v=v20',
      fontWeight: 600,
      fontStyle: 'italic',
    },
    // Normal 700
    {
      src: 'https://fonts.gstatic.com/l/font?kit=UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjg&skey=c491285d6722e4fa&v=v20',
      fontWeight: 700,
    },
    // Italic 700
    {
      src: 'https://fonts.gstatic.com/l/font?kit=UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTcPtxRipWD&skey=e5dfd0c3910c7ec9&v=v20',
      fontWeight: 700,
      fontStyle: 'italic',
    },
  ],
});

// JetBrains Mono for technical text/branding
Font.register({
  family: 'JetBrains Mono',
  src: 'https://fonts.gstatic.com/l/font?kit=tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOT&skey=48ad01c60053c2ae&v=v24',
});

export const fonts = {
  sans: 'Inter',
  mono: 'JetBrains Mono',
};
