import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS, POINTS } from '../constants'

/**
 * Validates that a number is a safe non-negative integer.
 * Prevents NaN, Infinity, and negative values from being stored.
 */
function sanitizePoints(value: unknown): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  if (!Number.isFinite(num) || num < 0 || num > 10_000_000) {
    return 0
  }
  return Math.floor(num)
}

/**
 * Reads points from localStorage with validation.
 * Returns 0 if storage is corrupted or unavailable.
 */
function readPoints(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POINTS)
    if (raw === null) return 0
    const parsed = JSON.parse(raw)
    return sanitizePoints(parsed)
  } catch {
    return 0
  }
}

/**
 * Writes points to localStorage with error handling.
 */
function writePoints(value: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(value))
  } catch {
    // localStorage may be full or unavailable; fail silently
  }
}

/**
 * Reads completed task IDs from localStorage.
 */
function readCompletedTasks(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS)
    if (raw === null) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((v): v is string => typeof v === 'string'))
  } catch {
    return new Set()
  }
}

/**
 * Writes completed task IDs to localStorage.
 */
function writeCompletedTasks(tasks: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify([...tasks]))
  } catch {
    // Fail silently
  }
}

/**
 * Reads the last check-in date string (ISO format) from localStorage.
 */
function readLastCheckin(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_CHECKIN)
  } catch {
    return null
  }
}

/**
 * Writes the last check-in date string to localStorage.
 */
function writeLastCheckin(date: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_CHECKIN, date)
  } catch {
    // Fail silently
  }
}

/**
 * Returns true if the user has already checked in today.
 */
function hasCheckedInToday(): boolean {
  const last = readLastCheckin()
  if (last === null) return false
  const lastDate = new Date(last)
  const today = new Date()
  return (
    lastDate.getFullYear() === today.getFullYear() &&
    lastDate.getMonth() === today.getMonth() &&
    lastDate.getDate() === today.getDate()
  )
}

export interface UsePointsReturn {
  points: number
  completedTasks: Set<string>
  addPoints: (taskId: string, amount: number) => boolean
  completeTask: (taskId: string, points: number) => boolean
  isTaskCompleted: (taskId: string) => boolean
  canCheckIn: boolean
  checkIn: () => boolean
  resetPoints: () => void
}

/**
 * Hook for managing the points system with localStorage persistence.
 * All point additions are validated and capped to prevent manipulation.
 */
export function usePoints(): UsePointsReturn {
  const [points, setPoints] = useState<number>(0)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [canCheckIn, setCanCheckIn] = useState<boolean>(false)

  // Load from localStorage on mount
  useEffect(() => {
    setPoints(readPoints())
    setCompletedTasks(readCompletedTasks())
    setCanCheckIn(!hasCheckedInToday())
  }, [])

  // Update checkIn availability when a day passes
  useEffect(() => {
    const interval = setInterval(() => {
      setCanCheckIn(!hasCheckedInToday())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const addPoints = useCallback((taskId: string, amount: number): boolean => {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 10_000) {
      return false
    }
    if (typeof taskId !== 'string' || taskId.length === 0 || taskId.length > 200) {
      return false
    }
    setPoints((prev) => {
      const next = sanitizePoints(prev + amount)
      writePoints(next)
      return next
    })
    return true
  }, [])

  const completeTask = useCallback((taskId: string, taskPoints: number): boolean => {
    if (typeof taskId !== 'string' || taskId.length === 0) {
      return false
    }
    let success = false
    setCompletedTasks((prev) => {
      if (prev.has(taskId)) {
        return prev
      }
      const next = new Set(prev)
      next.add(taskId)
      writeCompletedTasks(next)
      success = true
      return next
    })
    if (success) {
      addPoints(taskId, taskPoints)
    }
    return success
  }, [addPoints])

  const isTaskCompleted = useCallback((taskId: string): boolean => {
    return completedTasks.has(taskId)
  }, [completedTasks])

  const checkIn = useCallback((): boolean => {
    if (hasCheckedInToday()) {
      return false
    }
    const now = new Date().toISOString()
    writeLastCheckin(now)
    setCanCheckIn(false)
    return addPoints('daily-checkin', POINTS.DAILY_CHECKIN)
  }, [addPoints])

  const resetPoints = useCallback((): void => {
    setPoints(0)
    setCompletedTasks(new Set())
    setCanCheckIn(true)
    writePoints(0)
    writeCompletedTasks(new Set())
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.LAST_CHECKIN)
      } catch {
        // Fail silently
      }
    }
  }, [])

  return {
    points,
    completedTasks,
    addPoints,
    completeTask,
    isTaskCompleted,
    canCheckIn,
    checkIn,
    resetPoints,
  }
}
