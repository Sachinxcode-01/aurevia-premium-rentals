import { CameraSensorSpec } from "../data/cinematography-data";

export interface OpticalCalculationResult {
  horizontalFovDeg: number;
  verticalFovDeg: number;
  diagonalFovDeg: number;
  cropFactor: number;
  equivalentFocalLengthMm: number;
  nativeAspectRatio: number;
  desqueezedAspectRatio: number;
  hyperfocalDistanceMeters: number;
  nearLimitMeters: number;
  farLimitMeters: number | "Infinity";
  totalDofMeters: number | "Infinity";
  imageCircleCoveragePercentage: number;
  hasVignetting: boolean;
  viewfinderScale: number;
  horizontalStretchScale: number;
}

const FULL_FRAME_DIAGONAL_MM = Math.sqrt(36.0 * 36.0 + 24.0 * 24.0); // ~43.2666 mm

export function calculateOpticalSpecs(
  sensor: CameraSensorSpec,
  focalLengthMm: number,
  squeezeFactor: number = 1.0,
  aperture: number = 2.8,
  focusDistanceMeters: number = 3.0,
  lensImageCircleMm: number = 43.3
): OpticalCalculationResult {
  const width = Math.max(1, sensor.sensorWidthMm);
  const height = Math.max(1, sensor.sensorHeightMm);
  const diagonal = Math.sqrt(width * width + height * height);

  // Effective optical focal length horizontally when taking anamorphic squeeze into account
  // 2 * atan( (W / 2) / (f * squeeze) )
  const hFovRad = 2 * Math.atan((width / 2) / (focalLengthMm * squeezeFactor));
  const horizontalFovDeg = (hFovRad * 180) / Math.PI;

  // Vertical FOV is determined purely by physical height and focal length
  const vFovRad = 2 * Math.atan((height / 2) / focalLengthMm);
  const verticalFovDeg = (vFovRad * 180) / Math.PI;

  // Diagonal FOV
  const dFovRad = 2 * Math.atan((diagonal / 2) / focalLengthMm);
  const diagonalFovDeg = (dFovRad * 180) / Math.PI;

  // Crop Factor vs Standard Full-Frame 35mm
  const cropFactor = Number((FULL_FRAME_DIAGONAL_MM / diagonal).toFixed(2));
  const equivalentFocalLengthMm = Math.round(focalLengthMm * cropFactor);

  const nativeAspectRatio = Number((width / height).toFixed(2));
  const desqueezedAspectRatio = Number(((width / height) * squeezeFactor).toFixed(2));

  // Circle of confusion estimation based on sensor pitch or standard format rules
  // Standard approximation: diagonal / 1442 (approx 0.030mm for FF, 0.020mm for S35)
  const circleOfConfusionMm = diagonal / 1500;

  // Hyperfocal distance in millimeters: H = f^2 / (N * c) + f
  const hyperfocalMm = (focalLengthMm * focalLengthMm) / (aperture * circleOfConfusionMm) + focalLengthMm;
  const hyperfocalDistanceMeters = Number((hyperfocalMm / 1000).toFixed(2));

  const focusDistanceMm = focusDistanceMeters * 1000;

  let nearLimitMeters = 0;
  let farLimitMeters: number | "Infinity" = "Infinity";
  let totalDofMeters: number | "Infinity" = "Infinity";

  if (focusDistanceMm > 0) {
    const nearMm = (hyperfocalMm * focusDistanceMm) / (hyperfocalMm + (focusDistanceMm - focalLengthMm));
    nearLimitMeters = Number(Math.max(0.1, nearMm / 1000).toFixed(2));

    if (focusDistanceMm >= hyperfocalMm) {
      farLimitMeters = "Infinity";
      totalDofMeters = "Infinity";
    } else {
      const farMm = (hyperfocalMm * focusDistanceMm) / (hyperfocalMm - (focusDistanceMm - focalLengthMm));
      if (farMm <= 0 || !isFinite(farMm)) {
        farLimitMeters = "Infinity";
        totalDofMeters = "Infinity";
      } else {
        farLimitMeters = Number((farMm / 1000).toFixed(2));
        totalDofMeters = Number((farLimitMeters - nearLimitMeters).toFixed(2));
      }
    }
  }

  // Image circle coverage
  const coverageRatio = lensImageCircleMm / diagonal;
  const imageCircleCoveragePercentage = Math.min(100, Math.round(coverageRatio * 100));
  const hasVignetting = diagonal > lensImageCircleMm;

  // Viewfinder scaling factor relative to 35mm on a 36mm Full-Frame base
  // Scale increases as focal length increases (narrowing FOV = zoom in)
  const baseFovDeg = (2 * Math.atan((36.0 / 2) / 35) * 180) / Math.PI; // ~54.43 deg
  const viewfinderScale = Math.max(0.3, Math.min(6.0, baseFovDeg / horizontalFovDeg));
  const horizontalStretchScale = squeezeFactor;

  return {
    horizontalFovDeg: Number(horizontalFovDeg.toFixed(1)),
    verticalFovDeg: Number(verticalFovDeg.toFixed(1)),
    diagonalFovDeg: Number(diagonalFovDeg.toFixed(1)),
    cropFactor,
    equivalentFocalLengthMm,
    nativeAspectRatio,
    desqueezedAspectRatio,
    hyperfocalDistanceMeters,
    nearLimitMeters,
    farLimitMeters,
    totalDofMeters,
    imageCircleCoveragePercentage,
    hasVignetting,
    viewfinderScale,
    horizontalStretchScale,
  };
}
