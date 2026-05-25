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
        // 弱化边框：用半透明用户色，宽度仅 1px；inactive 时几乎不可见
        border: active ? `1px solid ${user.color}55` : `1px solid rgba(0,0,0,0.08)`,
        // 移除发光阴影
        boxShadow: 'none',
        opacity: dimWhenInactive && !active ? 0.4 : 1,
        filter: dimWhenInactive && !active ? 'grayscale(0.5)' : 'none',
        transition: 'all .2s ease',
        flexShrink: 0,
        backgroundColor: '#fff',
        ...style,
      }}
    />
  )
}
