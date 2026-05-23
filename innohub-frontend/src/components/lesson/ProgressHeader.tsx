import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProgressHeaderProps {
  courseId: string;
  courseTitle: string;
}

const ProgressHeader = ({ courseId, courseTitle }: ProgressHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => navigate(`/course/${courseId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kursga qaytish
      </Button>
      <h1 className="hidden text-sm font-medium text-muted-foreground sm:block">
        {courseTitle}
      </h1>
    </div>
  );
};

export default ProgressHeader;
