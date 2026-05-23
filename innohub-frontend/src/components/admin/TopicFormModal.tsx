import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, EyeOff, X, ExternalLink } from "lucide-react";
import { type TopicMutationPayload } from "@/types/api";

interface TopicFormModalProps {
  mode: "create" | "edit";
  form: {
    courseId: string;
    order: number;
    title: string;
    videoId: string;
    duration: string;
    content: string;
  };
  courseOptions: Array<{ id: string; title: string }>;
  isSubmitting: boolean;
  formError?: string;
  onClose: () => void;
  onChange: (next: any) => void;
  onSubmit: () => void;
}

const inputClassName = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

const TopicFormModal = ({
  mode,
  form,
  courseOptions,
  isSubmitting,
  formError,
  onClose,
  onChange,
  onSubmit,
}: TopicFormModalProps) => {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-xl font-semibold">{mode === "edit" ? "Mavzuni tahrirlash" : "Yangi mavzu"}</h2>
          <button onClick={onClose} className="rounded-xl border border-border p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <select
              value={form.courseId}
              onChange={(e) => onChange({ ...form, courseId: e.target.value })}
              className={inputClassName}
            >
              {courseOptions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={form.order}
                onChange={(e) => onChange({ ...form, order: Number(e.target.value) })}
                placeholder="Tartib"
                className={inputClassName}
              />
              <input
                value={form.duration}
                onChange={(e) => onChange({ ...form, duration: e.target.value })}
                placeholder="Davomiyligi (masalan 12:45)"
                className={inputClassName}
              />
            </div>

            <input
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="Mavzu nomi"
              className={inputClassName}
            />

            <input
              value={form.videoId}
              onChange={(e) => onChange({ ...form, videoId: e.target.value })}
              placeholder="Video ID (masalan dQw4w9WgXcQ)"
              className={inputClassName}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mazmuni (Markdown)</label>
                <button onClick={() => setIsPreview(!isPreview)} className="text-xs text-primary underline">
                  {isPreview ? "Tahrirlash" : "Preview"}
                </button>
              </div>
              {isPreview ? (
                <div className="prose prose-invert max-h-[200px] overflow-y-auto rounded-xl border border-border bg-muted p-4 text-sm">
                  <ReactMarkdown>{form.content}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={form.content}
                  onChange={(e) => onChange({ ...form, content: e.target.value })}
                  rows={6}
                  className={`${inputClassName} resize-none`}
                />
              )}
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <div className="rounded-xl border border-border bg-muted p-5 space-y-4">
            <h3 className="font-semibold">Mavzu ko'rinishi</h3>
            <div className="aspect-video w-full rounded-lg bg-black flex items-center justify-center text-xs text-white/50">
              {form.videoId ? `Video ID: ${form.videoId}` : "Video kodi kiritilmadi"}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Kurs</p>
              <p className="text-sm font-medium">{courseOptions.find(c => c.id === form.courseId)?.title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sarlavha</p>
              <p className="text-sm font-medium">{form.title || "Sarlavha kiritilmadi"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-muted-foreground">Bekor qilish</button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicFormModal;
