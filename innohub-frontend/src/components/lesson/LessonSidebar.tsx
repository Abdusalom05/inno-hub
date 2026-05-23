import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Topic {
  id: string;
  title: string;
  lessonNumber: number;
  duration: string;
  completed?: boolean;
}

interface LessonSidebarProps {
  courseTitle: string;
  courseId: string;
  topics: Topic[];
  currentTopicId: string;
  completedTopicsCount: number;
  totalLessons: number;
  isCurrentLessonCompleted: boolean;
}

const LessonSidebar = ({
  courseTitle,
  courseId,
  topics,
  currentTopicId,
  completedTopicsCount,
  totalLessons,
  isCurrentLessonCompleted,
}: LessonSidebarProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border border-gray-200 bg-gray-50 dark:border-[#1E293B] dark:bg-[#111111]">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#F8FAFC]">{courseTitle}</h2>
          <p className="text-sm text-gray-500 dark:text-[#94A3B8]">
            {completedTopicsCount}/{totalLessons} dars tugatildi
          </p>
        </div>

        <div className="space-y-2">
          {topics.map((topic) => {
            const active = topic.id === currentTopicId;
            const completed = topic.completed || (active && isCurrentLessonCompleted);

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => navigate(`/course/${courseId}/lesson/${topic.id}`)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-[#22C55E] bg-[#22C55E]/10"
                    : "border-gray-200 bg-white hover:border-[#22C55E] dark:border-[#1E293B] dark:bg-[#0D0D0D]"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/10 text-sm font-semibold text-[#22C55E]">
                  {topic.lessonNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-[#F8FAFC]">{topic.title}</p>
                  <p className="text-xs text-gray-500 dark:text-[#94A3B8]">{topic.duration}</p>
                </div>
                {completed ? <CheckCircle2 className="h-4 w-4 text-[#22C55E]" /> : null}
              </button>
            );
          })}
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link to={`/course/${courseId}`}>Kurs tafsilotlari</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default LessonSidebar;
