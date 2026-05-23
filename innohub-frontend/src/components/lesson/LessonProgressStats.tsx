import { Button } from "@/components/ui/button";

interface LessonProgressStatsProps {
  watchedSeconds: number;
  durationSeconds: number;
  watchedPercent: number;
  isCompleted: boolean;
  isMutating: boolean;
  onManualComplete: () => void;
  completionThresholdPercent: number;
}

const LessonProgressStats = ({
  watchedSeconds,
  durationSeconds,
  watchedPercent,
  isCompleted,
  isMutating,
  onManualComplete,
  completionThresholdPercent,
}: LessonProgressStatsProps) => {
  const hasWatchedEnough = watchedPercent >= completionThresholdPercent;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm text-gray-500 dark:text-[#94A3B8]">
          Haqiqiy tomosha:{" "}
          <span className="font-semibold text-gray-900 dark:text-[#F8FAFC]">{watchedSeconds}s</span>
          {durationSeconds > 0 ? (
            <span className="text-gray-500 dark:text-[#94A3B8]"> / {Math.floor(durationSeconds)}s ({watchedPercent}%)</span>
          ) : null}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-[#1E293B]">
          <div
            className="h-full rounded-full bg-[#22C55E] transition-all"
            style={{ width: `${watchedPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-[#94A3B8]">
          Dars avtomatik yakunlanishi uchun videoning kamida {completionThresholdPercent}% qismi tomosha qilinishi kerak.
        </p>
      </div>

      <Button
        className="bg-[#22C55E] font-semibold text-black hover:bg-[#16A34A]"
        onClick={onManualComplete}
        disabled={isMutating || isCompleted || !hasWatchedEnough}
      >
        {isCompleted
          ? "Tugatilgan"
          : isMutating
            ? "Saqlanmoqda..."
            : hasWatchedEnough
              ? "Darsni tugatish"
              : `${completionThresholdPercent}% tomosha qiling`}
      </Button>
    </div>
  );
};

export default LessonProgressStats;
