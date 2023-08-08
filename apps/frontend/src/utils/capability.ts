export function hasCapability(cap: string, bitPos: number) {
  return !!(BigInt(cap) & (1n << BigInt(bitPos)))
}
