import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type { UserId } from '../contexts/IdentityContext'
import { celebrateCheckin } from '../utils/celebrate'

export type CheckinId = string | number
export type CheckinSet = Set<string>

export interface CheckinRowBase {
  user_id: string
  checked_at: string
  photo_url?: string | null
}

export interface CheckinResourceHookOptions<Row extends CheckinRowBase, Id extends CheckinId> {
  queryKey: QueryKey
  idColumn: keyof Row & string
  fetchRows: () => Promise<Row[]>
  addRow: (userId: UserId, itemId: Id) => Promise<Row>
  removeRow: (userId: UserId, itemId: Id) => Promise<void>
  makeOptimisticRow: (userId: UserId, itemId: Id) => Row
}

export interface ToggleCheckinVars<Id extends CheckinId> {
  userId: UserId
  itemId: Id
  checked: boolean
}

function rowKey<Row extends CheckinRowBase>(row: Row, idColumn: keyof Row & string): string {
  return `${row.user_id}:${String(row[idColumn])}`
}

function rowsToSet<Row extends CheckinRowBase>(rows: Row[], idColumn: keyof Row & string): CheckinSet {
  return new Set(rows.map((row) => rowKey(row, idColumn)))
}

export function useCheckinRows<Row extends CheckinRowBase, Id extends CheckinId>(
  options: CheckinResourceHookOptions<Row, Id>
) {
  return useQuery({
    queryKey: options.queryKey,
    queryFn: options.fetchRows,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
}

export function useCheckinSetForResource<Row extends CheckinRowBase, Id extends CheckinId>(
  options: CheckinResourceHookOptions<Row, Id>
): CheckinSet {
  const { data } = useCheckinRows(options)
  return useMemo(() => rowsToSet(data ?? [], options.idColumn), [data, options.idColumn])
}

export function useIsResourceChecked<Row extends CheckinRowBase, Id extends CheckinId>(
  options: CheckinResourceHookOptions<Row, Id>,
  userId: UserId | null,
  itemId: Id
): boolean {
  const set = useCheckinSetForResource(options)
  if (!userId) return false
  return set.has(`${userId}:${String(itemId)}`)
}

export function useToggleCheckinResource<Row extends CheckinRowBase, Id extends CheckinId>(
  options: CheckinResourceHookOptions<Row, Id>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, itemId, checked }: ToggleCheckinVars<Id>) => {
      if (checked) {
        await options.removeRow(userId, itemId)
      } else {
        await options.addRow(userId, itemId)
      }
    },
    onMutate: async ({ userId, itemId, checked }) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey })
      const previous = queryClient.getQueryData<Row[]>(options.queryKey) ?? []
      const key = `${userId}:${String(itemId)}`

      const updated = checked
        ? previous.filter((row) => rowKey(row, options.idColumn) !== key)
        : [options.makeOptimisticRow(userId, itemId), ...previous]

      queryClient.setQueryData<Row[]>(options.queryKey, updated)
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData<Row[]>(options.queryKey, ctx.previous)
      }
    },
    onSuccess: (_data, { userId, checked }) => {
      if (!checked) {
        try {
          celebrateCheckin(userId)
        } catch {
          /* ignore */
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey })
    },
  })
}
