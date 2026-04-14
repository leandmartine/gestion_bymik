import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Fondo degradado negro a gris oscuro
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#0a0a0a')
  grad.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = grad
  const r = size * 0.2
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Letra "B" en blanco
  const fontSize = size * 0.55
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('B', size / 2, size / 2)

  // Brillo sutil
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath()
  ctx.ellipse(size * 0.35, size * 0.3, size * 0.2, size * 0.12, -Math.PI / 4, 0, Math.PI * 2)
  ctx.fill()

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync(join(__dir, '../public/icon-192.png'), drawIcon(192))
  writeFileSync(join(__dir, '../public/icon-512.png'), drawIcon(512))
  console.log('Iconos generados: icon-192.png y icon-512.png')
} catch (e) {
  console.error('Error:', e.message)
}
