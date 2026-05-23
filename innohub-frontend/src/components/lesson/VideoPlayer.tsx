import { type SyntheticEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface VideoPlayerProps {
  videoSource: string;
  onProgress: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onDurationChange: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onSeeked: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onEnded: (event: SyntheticEvent<HTMLVideoElement>) => void;
}

const VideoPlayer = ({
  videoSource,
  onProgress,
  onDurationChange,
  onSeeked,
  onEnded,
}: VideoPlayerProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="p-0">
        <div className="aspect-video w-full bg-black">
          {videoSource ? (
            <video
              src={videoSource}
              controls
              playsInline
              className="h-full w-full"
              onTimeUpdate={onProgress}
              onDurationChange={onDurationChange}
              onSeeked={onSeeked}
              onEnded={onEnded}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Video yuklanmadi.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
