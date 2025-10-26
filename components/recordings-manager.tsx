"use client";

import { Edit, Trash } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { deleteRecordingWithRelations } from "@/lib/form-actions";
import type { Recording } from "@/db/schema";
import { getRecordings } from "@/lib/actions";
import RecordingDownload from "./recording-download";
import RecordingsForm from "./recordings-form";
import AddButton from "./add-button";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useSession } from "next-auth/react";

type RecordingWithProgram = Recording & {
  program?: string;
};

export function RecordingsManager() {
  const [recordings, setRecordings] = useState<RecordingWithProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const user = useSession({ required: true });

  const loadRecordings = async () => {
    setIsLoading(true);
    try {
      const result = await getRecordings();
      if (result.success) {
        setRecordings(result.data!);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("не удалось загрузить записи: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  // reload recordings when form is closed
  useEffect(() => {
    if (!isCreating && !editingId) {
      loadRecordings();
    }
  }, [isCreating, editingId]);

  const handleEdit = (recording: RecordingWithProgram) => {
    setEditingId(recording.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("вы уверены, что хотите удалить эту запись?")) {
      startTransition(async () => {
        try {
          const result = await deleteRecordingWithRelations(id);
          if (result.success) {
            toast.success("файл удалён успешно");
            await loadRecordings();
          } else {
            toast.error(result.error);
          }
        } catch (error) {
          console.log(error);
          toast.error("не удалось удалить файл");
        }
      });
    }
  };

  function formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  if (isLoading) {
    return <div className="p-6">загрузка файлов...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold pl-4">файлы</h2>
        {!isCreating && <AddButton onClick={() => setIsCreating(true)} />}
      </div>

      {isCreating && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            {editingId ? "редактор" : "новый файл"}
          </h3>
          <RecordingsForm
            editingId={editingId}
            setEditingId={setEditingId}
            setIsCreating={setIsCreating}
          />
        </div>
      )}

      <div className="space-y-4">
        {recordings.map((recording) => (
          <Card key={recording.id} className="p-4">
            <div className="flex justify-between items-stretch">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2 flex-col sm:flex-row">
                  <h3 className="text-lg font-medium">
                    {recording.episodeTitle}
                  </h3>
                  <div className="flex gap-2 py-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        recording.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {recording.status === "published"
                        ? "опубликовано"
                        : "скрыто"}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        recording.type === "live"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-primary"
                      }`}
                    >
                      {recording.type === "live" ? "прямой эфир" : "подкаст"}
                    </span>
                  </div>
                </div>
                {recording.program && (
                  <p className="text-gray-600 mb-1 text-lg">
                    передача: {recording.program}
                  </p>
                )}
                {recording.description && (
                  <p className="text-gray-600 mb-2">{recording.description}</p>
                )}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    дата выхода:{" "}
                    {new Date(recording.releaseDate).toLocaleDateString(
                      "ru-RU"
                    )}
                  </p>
                  {recording.duration && (
                    <p>длительность: {formatDuration(recording.duration)}</p>
                  )}
                  {recording.keywords && (
                    <p>ключевые слова: {recording.keywords}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-between ml-4">
                <div className="flex space-x-3 ml-4">
                  <button
                    onClick={() => handleEdit(recording)}
                    className="text-primary hover:text-primary-hover/80"
                    disabled={isPending}
                  >
                    <Edit />
                  </button>
                  {user.data?.user.role === "admin" && (
                    <button
                      onClick={() => handleDelete(recording.id)}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={isPending}
                    >
                      <Trash />
                    </button>
                  )}
                </div>
                <div className="flex-grow"></div>
                <div className="text-right">
                  <RecordingDownload fileUrl={recording.fileUrl} />
                </div>
              </div>
            </div>
          </Card>
        ))}
        {recordings.length === 0 && (
          <p className="text-muted-foreground text-center py-8">нет файлов</p>
        )}
      </div>
    </div>
  );
}
