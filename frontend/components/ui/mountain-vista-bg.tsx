import React, { useMemo } from 'react';



// Data Configuration
const layersData = [
  { className: 'layer-6', speed: '120s', size: '222px', zIndex: 1, image: '6' },
  { className: 'layer-5', speed: '95s',  size: '311px', zIndex: 1, image: '5' },
  { className: 'layer-4', speed: '75s',  size: '468px', zIndex: 1, image: '4' },
  { className: 'bike-1',  speed: '10s',  size: '75px',  zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'bike-2',  speed: '15s',  size: '75px',  zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'layer-3', speed: '55s',  size: '158px', zIndex: 3, image: '3' },
  { className: 'layer-2', speed: '30s',  size: '145px', zIndex: 4, image: '2' },
  { className: 'layer-1', speed: '20s',  size: '136px', zIndex: 5, image: '1' },
];

interface MountainVistaParallaxProps {
  title?: string;
  subtitle?: string;
}

const MountainVistaParallax: React.FC<MountainVistaParallaxProps> = ({ title = '', subtitle = '' }) => {
  // Generate dynamic CSS for each layer
  const dynamicStyles = useMemo(() => {
    return layersData
      .map(layer => {
        const url = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/24650/${layer.image}.png`;
        return `
          .${layer.className} {
            background-image: url(${url});
            animation-duration: ${layer.speed};
            background-size: auto ${layer.size};
            z-index: ${layer.zIndex};
            ${layer.animation ? `animation-name: ${layer.animation};` : ''}
            ${layer.bottom ? `bottom: ${layer.bottom};` : ''}
            ${layer.noRepeat ? 'background-repeat: no-repeat;' : ''}
          }
        `;
      })
      .join('\n');
  }, []);

  return (
    <section
      className="hero-container relative overflow-hidden h-[400px] w-full rounded-3xl mb-8"
      aria-label="An animated parallax landscape of mountains and cyclists."
    >
      {/* Inject dynamic layer styles */}
      <style>{dynamicStyles}</style>

      {/* Render each parallax layer */}
      {layersData.map(layer => (
        <div
          key={layer.className}
          className={`parallax-layer absolute bottom-0 left-0 w-full h-full bg-repeat-x bg-bottom pointer-events-none ${layer.className}`}
        />
      ))}

      {/* Hero text */}
      <div className="hero-content relative z-10 flex flex-col items-center justify-center h-full text-center px-4">

        {title && <h1 className="hero-title text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tighter">{title}</h1>}
        {subtitle && <p className="hero-subtitle text-white/90 mt-2 font-medium max-w-lg drop-shadow-md">{subtitle}</p>}
      </div>
      
      {/* Gradient Overlay for better text visibility and blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-0" />
    </section>
  );
};

export default React.memo(MountainVistaParallax);
