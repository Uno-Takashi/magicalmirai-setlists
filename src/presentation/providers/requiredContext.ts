import { use, type Context } from 'react'

/**
 * Provider の内側でしか意味を持たない文脈を読む。外側で呼ばれたら、
 * どの Provider が足りないのかを添えて落とす (null のまま進むと原因が追えない)。
 */
export function useRequiredContext<T>(context: Context<T | null>, hookName: string): T {
  const value = use(context)
  if (value === null) {
    throw new Error(`${hookName} は対応する Provider の内側で呼び出してください`)
  }
  return value
}
