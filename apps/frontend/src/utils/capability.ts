export function hasCapability(cap: string, bitPos: number) {
  return !!(BigInt(cap) & (1n << BigInt(bitPos)))
}

export const orgBits = {
  access: 0,
  admin: 1,
  problem: 2,
  contest: 3,
  plan: 4
}

export const problemBits = {
  access: 0,
  admin: 1,
  solution: 2,
  content: 3,
  data: 4
}

export const contestBits = {
  access: 0,
  admin: 1,
  content: 2,
  data: 3
}

export const planBits = {
  access: 0,
  admin: 1,
  content: 2
}
