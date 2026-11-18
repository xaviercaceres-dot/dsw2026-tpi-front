const SIZE_MAP = {
  sm: 'w-9 h-9 text-base',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-2xl',
};

const DOT_SIZE_MAP = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

function DoctorAvatar({
  variant = 'rounded',
  size = 'md',
  showStatus = true,
  bgClass = 'bg-[#E6F2FA]',
  emoji = '👨‍⚕️',
  className = '',
}) {
  const shapeClass = variant === 'circle' ? 'rounded-full' : 'rounded-xl';
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const dotSizeClass = DOT_SIZE_MAP[size] || DOT_SIZE_MAP.md;

  return (
    <div
      className={`${sizeClass} ${shapeClass} ${bgClass} text-[#133B5C] flex items-center justify-center relative shrink-0 ${className}`.trim()}
    >
      <span>{emoji}</span>
      {showStatus && (
        <span
          className={`${dotSizeClass} rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5`}
        />
      )}
    </div>
  );
}

export default DoctorAvatar;
