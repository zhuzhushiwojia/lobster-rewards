import { useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../lib/hooks/usePoints'
import { TASKS } from '../lib/constants'

/**
 * Task list component displaying all available tasks.
 *
 * Tasks require wallet connection to be completed.
 * Daily check-in is limited to once per day.
 * All other tasks can only be completed once.
 */
export function TaskList() {
  const { publicKey } = useWallet()
  const { points, completedTasks, completeTask, isTaskCompleted, canCheckIn, checkIn } = usePoints()

  const completedCount = completedTasks.size
  const progressPercent = TASKS.length > 0 ? (completedCount / TASKS.length) * 100 : 0
  const earnedPoints = points

  const handleTaskClick = useCallback(
    (taskId: string, taskPoints: number) => {
      if (!publicKey) return
      if (taskId === 'daily-checkin') {
        checkIn()
      } else {
        completeTask(taskId, taskPoints)
      }
    },
    [publicKey, completeTask, checkIn]
  )

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-stone-950/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-400">Tasks</h3>
        <div className="text-right">
          <span className="text-sm text-stone-400">
            {completedCount}/{TASKS.length} Completed
          </span>
          <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-stone-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="mt-1 block text-xs text-amber-400">
            Progress {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      <div className="mb-3 text-sm text-stone-400">
        Earned <span className="font-semibold text-amber-400">{earnedPoints.toLocaleString()}</span> pts
      </div>

      <div className="space-y-2">
        {TASKS.map((task) => {
          const completed = isTaskCompleted(task.id)
          const isCheckinTask = task.id === 'daily-checkin'
          const canComplete = isCheckinTask ? canCheckIn : !completed
          const disabled = !publicKey || (isCheckinTask ? !canCheckIn : completed)

          return (
            <div
              key={task.id}
              className={`
                flex items-center gap-3 rounded-xl p-3 transition-colors
                ${completed
                  ? 'bg-green-950/30 border border-green-500/20'
                  : 'bg-stone-900/50 border border-stone-700/50 hover:border-amber-500/30'
                }
              `}
            >
              <span className="text-2xl">{task.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-white">{task.title}</h4>
                <p className="text-xs text-stone-400">{task.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-amber-400">+{taskPoints} pts</span>
                <button
                  onClick={() => handleTaskClick(task.id, task.points)}
                  disabled={disabled}
                  className={`
                    rounded-lg px-4 py-1.5 text-sm font-medium transition-all
                    ${completed || (isCheckinTask && !canCheckIn)
                      ? 'bg-green-900/50 text-green-400 cursor-default'
                      : !publicKey
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        : 'bg-amber-500 text-white hover:bg-amber-400 active:scale-95'
                    }
                  `}
                >
                  {completed
                    ? '\u2713 Done'
                    : isCheckinTask && !canCheckIn
                      ? 'Checked In'
                      : !publicKey
                        ? 'Connect'
                        : 'Complete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {!publicKey && (
        <p className="mt-4 text-center text-sm text-stone-500">
          Connect wallet to start tasks
        </p>
      )}
    </div>
  )
}
