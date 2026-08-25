import { renderHook, act } from '@testing-library/react'
import { usePoints } from '../lib/hooks/usePoints'
import { STORAGE_KEYS, POINTS } from '../lib/constants'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('usePoints', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('starts with 0 points', () => {
    const { result } = renderHook(() => usePoints())
    expect(result.current.points).toBe(0)
  })

  it('adds points when completing a task', () => {
    const { result } = renderHook(() => usePoints())

    act(() => {
      result.current.completeTask('follow-twitter', POINTS.FOLLOW_TWITTER)
    })

    expect(result.current.points).toBe(POINTS.FOLLOW_TWITTER)
  })

  it('prevents completing the same task twice', () => {
    const { result } = renderHook(() => usePoints())

    act(() => {
      const first = result.current.completeTask('follow-twitter', POINTS.FOLLOW_TWITTER)
      expect(first).toBe(true)
    })

    act(() => {
      const second = result.current.completeTask('follow-twitter', POINTS.FOLLOW_TWITTER)
      expect(second).toBe(false)
    })

    expect(result.current.points).toBe(POINTS.FOLLOW_TWITTER)
  })

  it('persists points in localStorage', () => {
    const { result } = renderHook(() => usePoints())

    act(() => {
      result.current.completeTask('join-discord', POINTS.JOIN_DISCORD)
    })

    const stored = JSON.parse(mockLocalStorage.getItem(STORAGE_KEYS.POINTS) ?? '0')
    expect(stored).toBe(POINTS.JOIN_DISCORD)
  })

  it('loads points from localStorage on mount', () => {
    mockLocalStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(500))

    const { result } = renderHook(() => usePoints())

    expect(result.current.points).toBe(500)
  })

  it('handles corrupted localStorage gracefully', () => {
    mockLocalStorage.setItem(STORAGE_KEYS.POINTS, 'not-json')

    const { result } = renderHook(() => usePoints())

    expect(result.current.points).toBe(0)
  })

  it('prevents negative point values', () => {
    mockLocalStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(-100))

    const { result } = renderHook(() => usePoints())

    expect(result.current.points).toBe(0)
  })

  it('prevents absurdly large point values', () => {
    mockLocalStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(999999999))

    const { result } = renderHook(() => usePoints())

    expect(result.current.points).toBe(0)
  })

  it('prevents invalid amounts in addPoints', () => {
    const { result } = renderHook(() => usePoints())

    act(() => {
      expect(result.current.addPoints('task-id', -50)).toBe(false)
      expect(result.current.addPoints('task-id', 0)).toBe(false)
      expect(result.current.addPoints('task-id', NaN)).toBe(false)
      expect(result.current.addPoints('task-id', Infinity)).toBe(false)
      expect(result.current.addPoints('task-id', 99999)).toBe(false)
    })

    expect(result.current.points).toBe(0)
  })

  it('allows daily check-in only once per day', () => {
    const { result } = renderHook(() => usePoints())

    expect(result.current.canCheckIn).toBe(true)

    act(() => {
      const success = result.current.checkIn()
      expect(success).toBe(true)
    })

    expect(result.current.points).toBe(POINTS.DAILY_CHECKIN)
    expect(result.current.canCheckIn).toBe(false)

    // Second check-in on same day should fail
    act(() => {
      const success = result.current.checkIn()
      expect(success).toBe(false)
    })

    expect(result.current.points).toBe(POINTS.DAILY_CHECKIN)
  })

  it('resets all points and tasks', () => {
    const { result } = renderHook(() => usePoints())

    act(() => {
      result.current.completeTask('follow-twitter', POINTS.FOLLOW_TWITTER)
      result.current.completeTask('join-discord', POINTS.JOIN_DISCORD)
    })

    expect(result.current.points).toBe(POINTS.FOLLOW_TWITTER + POINTS.JOIN_DISCORD)
    expect(result.current.completedTasks.size).toBe(2)

    act(() => {
      result.current.resetPoints()
    })

    expect(result.current.points).toBe(0)
    expect(result.current.completedTasks.size).toBe(0)
    expect(result.current.canCheckIn).toBe(true)
  })

  it('rejects empty task IDs', () => {
    const { result } = renderHook(() => usePoints())

    act(() => {
      expect(result.current.completeTask('', 100)).toBe(false)
    })

    expect(result.current.points).toBe(0)
  })
})
