
import React from 'react';
import { AvatarConfig, HairStyle, Accessory } from '../types';

interface AssetProps {
  className?: string;
}

// Helper for crisp pixel rendering
const PixelSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    shapeRendering="crispEdges" 
    {...props} 
  />
);

// --- Robot Model ---
const RobotModel: React.FC<{color: string}> = ({color}) => (
  <>
    {/* Antenna */}
    <rect x="11" y="0" width="2" height="3" fill="#94a3b8" />
    <rect x="10" y="0" width="4" height="1" fill="#ef4444" className="animate-pulse" />
    {/* Head */}
    <rect x="7" y="3" width="10" height="8" fill="#cbd5e1" />
    <rect x="8" y="5" width="8" height="3" fill="#0f172a" />
    <rect x="9" y="6" width="2" height="1" fill="#00ff00" className="animate-pulse" />
    <rect x="13" y="6" width="2" height="1" fill="#00ff00" className="animate-pulse" />
    {/* Body */}
    <rect x="6" y="11" width="12" height="8" fill={color} />
    <rect x="9" y="13" width="6" height="4" fill="#334155" />
    {/* Arms */}
    <rect x="4" y="11" width="2" height="6" fill="#94a3b8" />
    <rect x="18" y="11" width="2" height="6" fill="#94a3b8" />
    {/* Legs */}
    <rect x="8" y="19" width="3" height="5" fill="#475569" />
    <rect x="13" y="19" width="3" height="5" fill="#475569" />
  </>
);

// --- Animal Model (Bear/Cat hybrid style) ---
const AnimalModel: React.FC<{color: string}> = ({color}) => (
  <>
    {/* Ears */}
    <rect x="5" y="2" width="3" height="3" fill={color} />
    <rect x="16" y="2" width="3" height="3" fill={color} />
    {/* Head */}
    <rect x="6" y="4" width="12" height="9" fill={color} />
    <rect x="8" y="7" width="2" height="2" fill="#1e293b" />
    <rect x="14" y="7" width="2" height="2" fill="#1e293b" />
    <rect x="10" y="9" width="4" height="3" fill="#fde68a" /> {/* Snout */}
    <rect x="11" y="9" width="2" height="1" fill="#000" />
    {/* Body */}
    <rect x="8" y="13" width="8" height="7" fill={color} />
    <rect x="10" y="14" width="4" height="4" fill="#fde68a" />
    {/* Limbs */}
    <rect x="6" y="14" width="2" height="5" fill={color} />
    <rect x="16" y="14" width="2" height="5" fill={color} />
    <rect x="8" y="20" width="3" height="4" fill={color} />
    <rect x="13" y="20" width="3" height="4" fill={color} />
  </>
);

// --- Hair Components ---
const HairNormal: React.FC<{color: string}> = ({color}) => (
  <>
    <rect x="8" y="2" width="8" height="2" fill={color} />
    <rect x="8" y="2" width="2" height="4" fill={color} />
    <rect x="14" y="2" width="2" height="4" fill={color} />
  </>
);

const HairSpiky: React.FC<{color: string}> = ({color}) => (
  <>
    <rect x="8" y="1" width="2" height="2" fill={color} />
    <rect x="11" y="0" width="2" height="3" fill={color} />
    <rect x="14" y="1" width="2" height="2" fill={color} />
    <rect x="8" y="3" width="8" height="2" fill={color} />
    <rect x="7" y="4" width="1" height="3" fill={color} />
    <rect x="16" y="4" width="1" height="3" fill={color} />
  </>
);

const HairBob: React.FC<{color: string}> = ({color}) => (
  <>
    <rect x="7" y="2" width="10" height="3" fill={color} />
    <rect x="6" y="3" width="1" height="5" fill={color} />
    <rect x="17" y="3" width="1" height="5" fill={color} />
    <rect x="7" y="5" width="2" height="4" fill={color} />
    <rect x="15" y="5" width="2" height="4" fill={color} />
  </>
);

const HairPunk: React.FC<{color: string}> = ({color}) => (
  <>
    <rect x="10" y="0" width="4" height="6" fill={color} />
    <rect x="10" y="0" width="4" height="1" fill="#ef4444" opacity="0.8" />
    <rect x="9" y="4" width="1" height="3" fill={color} />
    <rect x="14" y="4" width="1" height="3" fill={color} />
  </>
);

// --- Accessory Components ---
const AccGlasses: React.FC = () => (
  <>
    <rect x="9" y="5" width="2" height="1" fill="#333" opacity="0.8" />
    <rect x="13" y="5" width="2" height="1" fill="#333" opacity="0.8" />
    <rect x="11" y="5" width="2" height="1" fill="#333" opacity="0.4" />
  </>
);

const AccHat: React.FC = () => (
  <>
    <rect x="7" y="1" width="10" height="2" fill="#dc2626" />
    <rect x="6" y="3" width="12" height="1" fill="#dc2626" />
  </>
);

const AccCrown: React.FC = () => (
  <>
    <polygon points="6,1 8,4 12,1 16,4 18,1 18,5 6,5" fill="#fbbf24" />
    <rect x="12" y="3" width="1" height="1" fill="#ef4444" />
  </>
);

const AccHeadphones: React.FC = () => (
  <>
    <rect x="6" y="4" width="2" height="4" fill="#333" />
    <rect x="16" y="4" width="2" height="4" fill="#333" />
    <path d="M7 4 C7 0, 17 0, 17 4" fill="none" stroke="#333" strokeWidth="1" />
  </>
);

// --- Main Player Component ---
export const PixelPlayer: React.FC<AssetProps & { config: AvatarConfig }> = ({ className, config }) => {
  const { model, colors, hairStyle, accessory } = config;

  if (model === 'robot') {
    return <PixelSvg className={className}><RobotModel color={colors.top} /></PixelSvg>;
  }

  if (model === 'animal') {
    return <PixelSvg className={className}><AnimalModel color={colors.skin} /></PixelSvg>;
  }

  const renderHair = () => {
    const hairColor = "#5d4037";
    switch(hairStyle) {
      case 'spiky': return <HairSpiky color={hairColor} />;
      case 'bob': return <HairBob color={hairColor} />;
      case 'punk': return <HairPunk color={hairColor} />;
      default: return <HairNormal color={hairColor} />;
    }
  };

  const renderAccessory = () => {
    switch(accessory) {
      case 'glasses': return <AccGlasses />;
      case 'hat': return <AccHat />;
      case 'crown': return <AccCrown />;
      case 'headphones': return <AccHeadphones />;
      default: return null;
    }
  };

  return (
    <PixelSvg className={className}>
      {/* Head */}
      <rect x="8" y="2" width="8" height="8" fill={colors.skin} />
      
      {/* Hair */}
      {renderHair()}

      {/* Eyes */}
      <rect x="10" y="5" width="1" height="1" fill="black" />
      <rect x="13" y="5" width="1" height="1" fill="black" />
      
      {/* Accessory */}
      {renderAccessory()}
      
      {/* Body (Top) */}
      <rect x="8" y="10" width="8" height="7" fill={colors.top} />
      {/* Logo on shirt */}
      <rect x="11" y="12" width="2" height="2" fill="white" opacity="0.5" />
      
      {/* Arms */}
      <rect x="5" y="10" width="3" height="7" fill={colors.skin} />
      <rect x="5" y="10" width="3" height="2" fill={colors.top} /> 
      <rect x="16" y="10" width="3" height="7" fill={colors.skin} />
      <rect x="16" y="10" width="3" height="2" fill={colors.top} /> 
      
      {/* Legs (Bottom) */}
      <rect x="8" y="17" width="3.5" height="7" fill={colors.bottom} />
      <rect x="12.5" y="17" width="3.5" height="7" fill={colors.bottom} />
      {/* Shoes */}
      <rect x="8" y="22" width="3.5" height="2" fill="#333" />
      <rect x="12.5" y="22" width="3.5" height="2" fill="#333" />
    </PixelSvg>
  );
};

// --- Resources ---
export const PixelWood: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="6" y="4" width="4" height="16" fill="#78350f" rx="1" />
    <rect x="14" y="6" width="4" height="14" fill="#92400e" rx="1" />
    <rect x="10" y="8" width="4" height="12" fill="#b45309" rx="1" />
  </PixelSvg>
);

export const PixelMetal: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="6" y="6" width="12" height="12" fill="#94a3b8" />
    <rect x="8" y="8" width="8" height="8" fill="#cbd5e1" />
    <rect x="6" y="6" width="2" height="2" fill="#475569" />
    <rect x="16" y="6" width="2" height="2" fill="#475569" />
    <rect x="6" y="16" width="2" height="2" fill="#475569" />
    <rect x="16" y="16" width="2" height="2" fill="#475569" />
  </PixelSvg>
);

// ... Previous Assets ...
export const PixelFriend: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className} opacity="0.7">
    <rect x="8" y="2" width="8" height="8" fill="#e2e8f0" />
    <rect x="10" y="5" width="1" height="1" fill="#94a3b8" />
    <rect x="13" y="5" width="1" height="1" fill="#94a3b8" />
    <rect x="8" y="10" width="8" height="7" fill="#cbd5e1" />
    <rect x="5" y="10" width="3" height="7" fill="#e2e8f0" />
    <rect x="16" y="10" width="3" height="7" fill="#e2e8f0" />
    <rect x="8" y="17" width="3.5" height="7" fill="#94a3b8" />
    <rect x="12.5" y="17" width="3.5" height="7" fill="#94a3b8" />
  </PixelSvg>
);

export const PixelMonkey: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <path d="M18 16h2v-4h2v-2h-2" fill="none" stroke="#8d5524" strokeWidth="2" />
    <rect x="8" y="10" width="8" height="8" fill="#8d5524" />
    <rect x="10" y="12" width="4" height="4" fill="#cca582" /> 
    <rect x="7" y="4" width="10" height="7" fill="#8d5524" />
    <rect x="8" y="6" width="8" height="4" fill="#cca582" /> 
    <rect x="5" y="5" width="2" height="2" fill="#8d5524" />
    <rect x="17" y="5" width="2" height="2" fill="#8d5524" />
    <rect x="10" y="7" width="1" height="1" fill="black" />
    <rect x="13" y="7" width="1" height="1" fill="black" />
    <rect x="8" y="18" width="2" height="4" fill="#8d5524" />
    <rect x="14" y="18" width="2" height="4" fill="#8d5524" />
    <rect x="6" y="11" width="2" height="5" fill="#8d5524" />
    <rect x="16" y="11" width="2" height="5" fill="#8d5524" />
  </PixelSvg>
);

export const PixelBanana: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <path d="M8 18 C 8 18, 10 20, 14 20 C 18 20, 20 16, 20 10" stroke="#fcd34d" strokeWidth="5" fill="none" />
    <path d="M8 18 C 8 18, 10 20, 14 20 C 18 20, 20 16, 20 10" stroke="#fbbf24" strokeWidth="2" fill="none" />
    <rect x="18" y="8" width="3" height="2" fill="#4b5563" />
  </PixelSvg>
);

export const PixelKey: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="4" y="8" width="6" height="8" fill="#fbbf24" />
    <rect x="6" y="10" width="2" height="4" fill="#b45309" /> 
    <rect x="10" y="11" width="10" height="2" fill="#fbbf24" />
    <rect x="16" y="13" width="2" height="3" fill="#fbbf24" />
    <rect x="19" y="13" width="2" height="2" fill="#fbbf24" />
  </PixelSvg>
);

export const PixelGem: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <polygon points="6,8 18,8 22,12 12,22 2,12" fill="#3b82f6" />
    <polygon points="6,8 12,12 18,8" fill="#60a5fa" />
    <polygon points="2,12 12,12 12,22" fill="#2563eb" />
    <polygon points="22,12 12,12 12,22" fill="#1d4ed8" />
  </PixelSvg>
);

export const PixelFlashlight: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="4" y="10" width="12" height="4" fill="#dc2626" />
    <rect x="16" y="8" width="4" height="8" fill="#991b1b" />
    <polygon points="20,8 20,16 22,12" fill="#fca5a5" />
  </PixelSvg>
);

export const PixelApple: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="8" y="8" width="8" height="8" rx="2" fill="#ef4444" />
    <rect x="11" y="6" width="2" height="2" fill="#65a30d" />
    <rect x="14" y="9" width="2" height="2" fill="#fca5a5" opacity="0.5" />
  </PixelSvg>
);

export const PixelMap: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="4" y="4" width="16" height="16" fill="#fde047" />
    <path d="M6 6 L10 10 L14 8 L18 18" stroke="#b45309" strokeWidth="1" fill="none" strokeDasharray="2,1" />
    <rect x="16" y="16" width="2" height="2" fill="#ef4444" />
  </PixelSvg>
);

export const PixelUnknown: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="4" y="4" width="16" height="16" fill="#cbd5e1" />
    <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#64748b">?</text>
  </PixelSvg>
);

export const PixelTree: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="10" y="14" width="4" height="10" fill="#5d4037" />
    <rect x="6" y="6" width="12" height="10" fill="#22c55e" rx="2"/>
    <rect x="8" y="4" width="8" height="4" fill="#22c55e" rx="1"/>
  </PixelSvg>
);

export const PixelCactus: React.FC<AssetProps> = ({ className }) => (
  <PixelSvg className={className}>
    <rect x="10" y="8" width="4" height="16" fill="#16a34a" />
    <rect x="4" y="10" width="4" height="4" fill="#16a34a" />
    <rect x="4" y="6" width="2" height="4" fill="#16a34a" />
    <rect x="16" y="12" width="4" height="4" fill="#16a34a" />
    <rect x="18" y="8" width="2" height="4" fill="#16a34a" />
  </PixelSvg>
);
