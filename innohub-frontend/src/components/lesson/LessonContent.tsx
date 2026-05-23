import ReactMarkdown from "react-markdown";
import { Clock3 } from "lucide-react";

interface LessonContentProps {
  lessonNumber: number;
  title: string;
  duration: string;
  content?: string | null;
}

const LessonContent = ({
  lessonNumber,
  title,
  duration,
  content,
}: LessonContentProps) => {
  return (
    <div className="space-y-5 p-6">
      <div className="space-y-2">
        <p className="text-sm text-[#22C55E]">Dars #{lessonNumber}</p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-[#F8FAFC]">{title}</h1>
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#94A3B8]">
          <Clock3 className="h-4 w-4 text-[#22C55E]" />
          {duration}
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-gray-600 dark:prose-invert dark:text-[#94A3B8]">
        <ReactMarkdown>{content ?? "Bu dars uchun matnli kontent hozircha mavjud emas."}</ReactMarkdown>
      </div>
    </div>
  );
};

export default LessonContent;
