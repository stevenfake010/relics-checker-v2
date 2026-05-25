import type { UserConfig } from '../contexts/IdentityContext'

interface AvatarProps {
  user: UserConfig
  /** 像素尺寸，默认 24 */
  size?: number
  /** 是否高亮（已打卡状态）- 加边框 */
  active?: boolean
  /** 未激活时是否变灰 */
  dimWhenInactive?: boolean
  title?: string
  className?: string
  style?: React.CSSProperties
}

export function Avatar({
  user,
  size = 24,
  active = false,
  dimWhenInactive = false,
  title,
  className = '',
  style = {},
}: AvatarProps) {
  return (
    <img
      src={user.avatar}
      alt={user.label}
      title={title ?? user.label}
      className={`inline-block rounded-full object-cover ${className}`}
      style={{
        width: size,
        height: size,
        border: active ? `2px solid ${user.color}` : `1.5px solid transparent`,
        boxShadow: active ? `0 0 0 1px rgba(255,255,255,0.5), 0 2px 4px ${user.color}40` : 'none',
        opacity: dimWhenInactive && !active ? 0.35 : 1,
        filter: dimWhenInactive && !active ? 'grayscale(0.6)' : 'none',
        transition: 'all .2s ease',
        flexShrink: 0,
        backgroundColor: '#fff',
        ...style,
      }}
    />
  )
}
