import confetti from 'canvas-confetti'
import { USER_CONFIGS, type UserId } from '../contexts/IdentityContext'

/**
 * 打卡庆祝礼花。
 * 按用户色调（佑=朱砂红，宝=玉绿）触发不同颜色的礼花。
 */
export function celebrateCheckin(userId: UserId) {
  const cfg = USER_CONFIGS[userId]
  const baseColor = cfg.color

  // 主色 + 金色 + 米白形成层次
  const colors = [baseColor, '#C9A96E', '#FAF7F2']

  // 中央小爆
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    scalar: 0.9,
  })

  // 两侧追加
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    })
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    })
  }, 200)
}
