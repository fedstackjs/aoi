export function palette(score: number) {
  // interpolation between red and green
  const start = '#2ecc71'
  const end = '#e74c3c'
  const t = score / 100
  const r = Math.floor(
    t * parseInt(start.slice(1, 3), 16) + (1 - t) * parseInt(end.slice(1, 3), 16)
  )
  const g = Math.floor(
    t * parseInt(start.slice(3, 5), 16) + (1 - t) * parseInt(end.slice(3, 5), 16)
  )
  const b = Math.floor(
    t * parseInt(start.slice(5, 7), 16) + (1 - t) * parseInt(end.slice(5, 7), 16)
  )
  return `rgb(${r}, ${g}, ${b})`
}
