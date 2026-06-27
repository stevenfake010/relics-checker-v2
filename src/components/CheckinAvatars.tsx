import { USER_CONFIGS } from '../contexts/IdentityContext'
import type { CheckinSet } from '../hooks/useCheckinResource'
import { Avatar } from './Avatar'

const USERS = ['zuo', 'huang'] as const

interface CheckinAvatarsProps {
  checkinSet: CheckinSet
  itemId: string | number
  size?: number
  gapClassName?: string
}

export function CheckinAvatars({
  checkinSet,
  itemId,
  size = 22,
  gapClassName = 'gap-0.5',
}: CheckinAvatarsProps) {
  return (
    <div className={`flex items-center flex-shrink-0 ${gapClassName}`}>
      {USERS.map((uid) => {
        const cfg = USER_CONFIGS[uid]
        const checked = checkinSet.has(`${uid}:${String(itemId)}`)
        return (
          <Avatar
            key={uid}
            user={cfg}
            size={size}
            active={checked}
            dimWhenInactive
            title={`${cfg.label}：${checked ? '已打卡' : '未打卡'}`}
          />
        )
      })}
    </div>
  )
}
