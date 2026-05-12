export interface CompatibilityRule {
  plantA: string;
  plantB: string;
  type: 'incompatible' | 'beneficial';
  maxDistanceM: number;
  reason: string;
  severity: 'warning' | 'critical';
}

export interface CompatibilityWarning {
  plantAInstanceId: string;
  plantBInstanceId: string;
  rule: CompatibilityRule;
  distanceM: number;
}
