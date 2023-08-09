export function hasCapability(cap: string, bitPos: number) {
  return !!(BigInt(cap) & (1n << BigInt(bitPos)))
}

export const orgBits = {
  access: 0,
  problem: 1,
  contest: 2,
  admin: 3
}

export const problemBits = {
  access: 0,
  solution: 1,
  content: 2,
  data: 3,
  admin: 4
}
