import type { FallbackOverrides } from '@/metrics/lookup'

export function buildFallbackFontFace(
  family: string,
  fallbackName: string,
  overrides: FallbackOverrides,
): string {
  return `@font-face {
  font-family: '${family} Fallback';
  src: local('${fallbackName}');
  size-adjust: ${overrides.sizeAdjust};
  ascent-override: ${overrides.ascentOverride};
  descent-override: ${overrides.descentOverride};
  line-gap-override: ${overrides.lineGapOverride};
}`
}
