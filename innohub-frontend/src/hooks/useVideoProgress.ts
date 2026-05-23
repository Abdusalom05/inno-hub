import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeLesson, trackLessonProgress } from "@/api/progress.api";

export type WatchRange = {
  start: number;
  end: number;
};

interface UseVideoProgressOptions {
  lessonId: string;
  courseId: string;
  initialWatchSeconds?: number;
  isInitiallyCompleted?: boolean;
  completionThreshold?: number;
}

const SEEK_TOLERANCE = 6;
const TRACK_DEBOUNCE = 800;

function mergeRanges(ranges: WatchRange[], next: WatchRange) {
  if (next.end <= next.start) return ranges;
  const sorted = [...ranges, next].sort((a, b) => a.start - b.start);
  const merged: WatchRange[] = [];
  sorted.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
    } else {
      last.end = Math.max(last.end, range.end);
    }
  });
  return merged;
}

export function useVideoProgress({
  lessonId,
  courseId,
  initialWatchSeconds = 0,
  isInitiallyCompleted = false,
  completionThreshold = 0.9,
}: UseVideoProgressOptions) {
  const queryClient = useQueryClient();
  const [watchedSeconds, setWatchedSeconds] = useState(initialWatchSeconds);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);

  const rangesRef = useRef<WatchRange[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const syncRef = useRef(initialWatchSeconds);
  const completionRef = useRef(isInitiallyCompleted);

  useEffect(() => {
    setWatchedSeconds(initialWatchSeconds);
    setIsCompleted(isInitiallyCompleted);
    syncRef.current = initialWatchSeconds;
    rangesRef.current = [];
    lastTimeRef.current = null;
    completionRef.current = isInitiallyCompleted;
  }, [lessonId, initialWatchSeconds, isInitiallyCompleted]);

  const completeMutation = useMutation({
    mutationFn: () => completeLesson(lessonId),
    onSuccess: () => {
      setIsCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["enrollments", "my-courses", courseId] });
    },
  });

  const checkCompletion = useCallback((current: number, total: number) => {
    if (completionRef.current || total <= 0) return;
    if (current / total >= completionThreshold) {
      completionRef.current = true;
      completeMutation.mutate();
    }
  }, [completionThreshold, completeMutation]);

  const recordPosition = useCallback((time: number, total: number) => {
    if (total > 0) setDuration(total);
    const prev = lastTimeRef.current;
    lastTimeRef.current = time;
    if (prev === null) return;

    const delta = time - prev;
    if (delta <= 0 || delta > SEEK_TOLERANCE) return;

    const end = total > 0 ? Math.min(time, total) : time;
    const start = Math.max(0, Math.min(prev, end));
    rangesRef.current = mergeRanges(rangesRef.current, { start, end });

    const sessionDuration = rangesRef.current.reduce((acc, r) => acc + (r.end - r.start), 0);
    const totalWatched = Math.floor(syncRef.current + sessionDuration);
    
    setWatchedSeconds(totalWatched);
    checkCompletion(totalWatched, total || duration);
  }, [checkCompletion, duration]);

  useEffect(() => {
    if (watchedSeconds <= 0 || watchedSeconds === syncRef.current) return;
    const timer = setTimeout(() => {
      trackLessonProgress(lessonId, { watchSeconds: watchedSeconds })
        .then(() => { syncRef.current = watchedSeconds; });
    }, TRACK_DEBOUNCE);
    return () => clearTimeout(timer);
  }, [lessonId, watchedSeconds]);

  return {
    watchedSeconds,
    duration,
    watchedPercent: duration > 0 ? Math.min(100, Math.round((watchedSeconds / duration) * 100)) : 0,
    isCompleted,
    isMutating: completeMutation.isPending,
    handleProgress: (event: SyntheticEvent<HTMLVideoElement>) => 
      recordPosition(event.currentTarget.currentTime, event.currentTarget.duration),
    handleDuration: (event: SyntheticEvent<HTMLVideoElement>) => 
      setDuration(event.currentTarget.duration),
    handleSeeked: (event: SyntheticEvent<HTMLVideoElement>) => 
      { lastTimeRef.current = event.currentTarget.currentTime; },
    handleEnded: (event: SyntheticEvent<HTMLVideoElement>) => 
      recordPosition(event.currentTarget.duration, event.currentTarget.duration),
  };
}
