import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { useEnrolledCourse } from "@/hooks/useEnrolledCourses";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import VideoPlayer from "@/components/lesson/VideoPlayer";
import LessonSidebar from "@/components/lesson/LessonSidebar";
import LessonContent from "@/components/lesson/LessonContent";
import LessonProgressStats from "@/components/lesson/LessonProgressStats";
import ProgressHeader from "@/components/lesson/ProgressHeader";

const Lesson = () => {
  const { courseId = "", lessonId = "" } = useParams<{ courseId: string; lessonId: string }>();
  const { data: course, isLoading, isError } = useEnrolledCourse(courseId, true);

  const topics = useMemo(() => course?.topics ?? [], [course]);
  const currentTopic = useMemo(() => topics.find((t) => t.id === lessonId), [lessonId, topics]);
  
  const {
    watchedSeconds,
    duration,
    watchedPercent,
    isCompleted,
    isMutating,
    handleProgress,
    handleDuration,
    handleSeeked,
    handleEnded,
  } = useVideoProgress({
    lessonId,
    courseId,
    initialWatchSeconds: currentTopic?.watchSeconds ?? 0,
    isInitiallyCompleted: !!currentTopic?.completed,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Yuklanmoqda...</div>;
  if (isError || !course || !currentTopic) return <Navigate to={`/course/${courseId}`} replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <ProgressHeader courseId={courseId} courseTitle={course.title} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr,1fr]">
          <div className="space-y-6">
            <VideoPlayer
              videoSource={currentTopic.videoId}
              onProgress={handleProgress}
              onDurationChange={handleDuration}
              onSeeked={handleSeeked}
              onEnded={handleEnded}
            />
            
            <div className="rounded-2xl border border-border bg-card">
              <LessonContent
                lessonNumber={currentTopic.lessonNumber}
                title={currentTopic.title}
                duration={currentTopic.duration}
                content={currentTopic.content}
              />
              <div className="p-6 pt-0">
                <LessonProgressStats
                  watchedSeconds={watchedSeconds}
                  durationSeconds={duration}
                  watchedPercent={watchedPercent}
                  isCompleted={isCompleted}
                  isMutating={isMutating}
                  onManualComplete={() => {}}
                  completionThresholdPercent={90}
                />
              </div>
            </div>
          </div>

          <LessonSidebar
            courseTitle={course.title}
            courseId={courseId}
            topics={topics}
            currentTopicId={currentTopic.id}
            completedTopicsCount={course.enrollment?.completedTopicsCount ?? 0}
            totalLessons={course.totalLessons}
            isCurrentLessonCompleted={isCompleted}
          />
        </div>
      </main>
    </div>
  );
};

export default Lesson;
