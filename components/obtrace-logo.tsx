type ObtraceLogoProps = {
  width?: number;
  height?: number;
  className?: string;
};

export function ObtraceLogo({ width = 148, height = 60, className }: ObtraceLogoProps) {
  return <img src="/obtrace-logo.svg" width={width} height={height} alt="Obtrace" className={className} />;
}
