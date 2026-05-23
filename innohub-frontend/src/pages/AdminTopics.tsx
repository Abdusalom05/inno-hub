import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createTopic, deleteTopic, updateTopic } from "@/api/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TopicFormModal from "@/components/admin/TopicFormModal";
import { useAdminCourses, useAdminTopics } from "@/hooks/useAdminData";
import { getApiErrorMessage } from "@/lib/api";
import type { TopicSummary } from "@/types/api";

const AdminTopics = () => {
  const queryClient = useQueryClient();
  const { data: courses = [] } = useAdminCourses();
  const { data: topics = [] } = useAdminTopics();
  
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  
  const initialForm = { courseId: "", order: 1, title: "", videoId: "", duration: "", content: "" };
  const [form, setForm] = useState(initialForm);

  const filteredTopics = useMemo(() => {
    const list = selectedCourseId === "all" ? topics : topics.filter(t => t.courseId === selectedCourseId);
    return [...list].sort((a, b) => a.lessonNumber - b.lessonNumber);
  }, [selectedCourseId, topics]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "topics"] });
      setIsModalOpen(false);
      setEditingId(null);
      toast.success("Muvaffaqiyatli bajarildi");
    },
    onError: (err: any) => {
      setFormError(getApiErrorMessage(err));
    }
  };

  const createMutation = useMutation({ mutationFn: createTopic, ...mutationOptions });
  const updateMutation = useMutation({ mutationFn: (data: any) => updateTopic(data.id, data.payload), ...mutationOptions });
  const deleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "topics"] })
  });

  const handleSubmit = () => {
    const payload = {
      courseId: form.courseId || courses[0]?.id,
      lessonNumber: form.order,
      title: form.title,
      videoId: form.videoId,
      durationLabel: form.duration,
      contentMarkdown: form.content,
      contentHtml: "", // Backend updates this
      isPreview: false,
      status: "PUBLISHED" as const
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mavzular</h1>
            <p className="text-muted-foreground">Kurslar bo'yicha darslarni boshqaring</p>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="rounded-xl border border-border bg-card px-4 py-2"
            >
              <option value="all">Barcha kurslar</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button
              onClick={() => { setEditingId(null); setForm(initialForm); setIsModalOpen(true); }}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Yangi mavzu
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Tartib</th>
                <th className="px-6 py-4">Nomi</th>
                <th className="px-6 py-4">YouTube ID</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTopics.map(topic => (
                <tr key={topic.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm">{topic.lessonNumber}</td>
                  <td className="px-6 py-4 font-medium">{topic.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{topic.videoId}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(topic.id);
                          setForm({
                            courseId: topic.courseId,
                            order: topic.lessonNumber,
                            title: topic.title,
                            videoId: topic.videoId,
                            duration: topic.duration,
                            content: topic.content || ""
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:text-primary"
                      ><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => deleteMutation.mutate(topic.id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <TopicFormModal
            mode={editingId ? "edit" : "create"}
            form={form}
            courseOptions={courses.map(c => ({ id: c.id, title: c.title }))}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            formError={formError}
            onClose={() => setIsModalOpen(false)}
            onChange={setForm}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
};

export default AdminTopics;
