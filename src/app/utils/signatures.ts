// Pre-integrated signatures for official roles
export const OFFICIAL_SIGNATURES = {
  'HR-001': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png', // HR
  'CSD-001': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Signature_of_Julius_Caesar.png', // Chief
  'PENR-001': 'https://upload.wikimedia.org/wikipedia/commons/7/70/George_Washington_Signature.png', // PENR
};

export function getIntegratedSignature(userId: string): string | null {
  return OFFICIAL_SIGNATURES[userId as keyof typeof OFFICIAL_SIGNATURES] || null;
}
