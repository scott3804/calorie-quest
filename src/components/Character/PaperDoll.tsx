interface SpriteProps {
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  shirtColor: string;
  showHair: boolean;
}

export const PaperDoll = ({
  skinColor,
  hairColor,
  eyeColor,
  shirtColor,
  showHair,
}: SpriteProps) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full shadow-inner bg-slate-200 rounded-xl"
  >
    {/* Body / Skin */}
    <rect x="30" y="20" width="40" height="40" fill={skinColor} /> {/* Head */}
    <rect x="25" y="60" width="50" height="30" fill={shirtColor} />{" "}
    {/* Torso */}
    {/* Eyes */}
    <rect x="38" y="35" width="6" height="6" fill={eyeColor} />
    <rect x="56" y="35" width="6" height="6" fill={eyeColor} />
    {/* Hair (Conditional) */}
    {showHair && (
      <path d="M30 25 Q50 5 70 25 L70 35 L30 35 Z" fill={hairColor} />
    )}
    {/* Mouth */}
    <rect x="45" y="50" width="10" height="2" fill="#000" opacity="0.3" />
  </svg>
);
