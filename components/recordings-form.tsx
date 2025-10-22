"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createRecordingWithRelations,
  updateRecordingWithRelations,
  getRecordingForForm,
  type RecordingFormData,
} from "@/lib/form-actions";
import { getPrograms } from "@/lib/actions";
import { getGenres } from "@/lib/actions";
import { getPeople } from "@/lib/actions";

export default function RecordingsForm({
  editingId,
  setEditingId,
  setIsCreating,
}: {
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<RecordingFormData>({
    programId: "",
    episodeTitle: "",
    description: "",
    type: "live",
    releaseDate: new Date(),
    duration: undefined,
    status: "published",
    keywords: "",
    genreIds: [],
    hosts: [],
    guests: [],
    fileUrl: "",
  });
  const audioFileRef = useRef<HTMLInputElement>(null);

  const [programs, setPrograms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  // load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      try {
        const [programsRes, genresRes, peopleRes] = await Promise.all([
          getPrograms(),
          getGenres(),
          getPeople(),
        ]);

        if (programsRes.success) setPrograms(programsRes.data!);
        if (genresRes.success) setGenres(genresRes.data!);
        if (peopleRes.success) setPeople(peopleRes.data!);
      } catch (error) {
        toast.error("не удалось загрузить данные");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  // load recording data for editing
  useEffect(() => {
    async function loadRecording() {
      if (!editingId) return;

      const result = await getRecordingForForm(editingId);
      if (result.success) {
        const { recording, genreIds, hosts, guests } = result.data;
        setFormData({
          programId: recording.programId,
          episodeTitle: recording.episodeTitle,
          description: recording.description || "",
          type: recording.type,
          releaseDate: recording.releaseDate,
          duration: recording.duration || undefined,
          status: recording.status,
          keywords: recording.keywords || "",
          genreIds,
          hosts,
          guests,
          fileUrl: recording.fileUrl,
        });
      } else {
        toast.error(result.error);
      }
    }

    loadRecording();
  }, [editingId]);

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener("loadedmetadata", () => {
        resolve(Math.round(audio.duration));
      });
      audio.addEventListener("error", () => {
        resolve(0);
      });
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (
      !file.type.includes("audio/mpeg") &&
      !file.name.toLowerCase().endsWith(".mp3")
    ) {
      toast.error("пожалуйста, выберите MP3 файл");
      return null;
    }

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      const uploadData = await fetch("/api/b2-upload-link");
      const { uploadUrl, authorizationToken } = await uploadData.json();
      formDataUpload.append("file", file);
      const duration = await getAudioDuration(file);

      const sha1Buffer = await crypto.subtle.digest(
        "SHA-1",
        await file.arrayBuffer()
      );
      const sha1Hex = [...new Uint8Array(sha1Buffer)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // 2. upload raw file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: authorizationToken,
          "X-Bz-File-Name": encodeURIComponent(file.name),
          "X-Bz-Content-Sha1": sha1Hex, // or 'do_not_verify'
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file, // ← send the File object directly, NOT FormData
      });

      if (!response.ok) {
        throw new Error("ошибка загрузки файла");
      }

      const res = await response.json();
      console.log(res);

      const { fileId } = await response.json();

      setFormData((prev) => ({
        ...prev,
        fileUrl: fileId,
        duration: duration,
      }));

      toast.success("аудиофайл загружен успешно");
      return fileId;
    } catch (error) {
      console.log(error);
      toast.error("не удалось загрузить аудиофайл: " + error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.programId ||
      !formData.episodeTitle ||
      !formData.releaseDate ||
      !formData.fileUrl
    ) {
      toast.error("пожалуйста, заполните все обязательные поля");
      return;
    }

    startTransition(async () => {
      try {
        let result;
        if (editingId) {
          result = await updateRecordingWithRelations(editingId, formData);
          if (result.success) {
            toast.success("запись обновлена успешно");
            setEditingId(null);
            setIsCreating(false);
          } else {
            toast.error(result.error);
          }
        } else {
          result = await createRecordingWithRelations(formData);
          if (result.success) {
            toast.success("запись создана успешно");
            setIsCreating(false);
          } else {
            toast.error(result.error);
          }
        }

        if (result.success) {
          setFormData({
            programId: "",
            episodeTitle: "",
            description: "",
            type: "live",
            releaseDate: new Date(),
            duration: undefined,
            status: "published",
            keywords: "",
            genreIds: [],
            hosts: [],
            guests: [],
            fileUrl: "",
          });

          if (audioFileRef.current) {
            audioFileRef.current.value = "";
          }
        }
      } catch (error: any) {
        toast.error(error.message || "не удалось сохранить запись");
      }
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      programId: "",
      episodeTitle: "",
      description: "",
      type: "live",
      releaseDate: new Date(),
      duration: undefined,
      status: "published",
      keywords: "",
      genreIds: [],
      hosts: [],
      guests: [],
      fileUrl: "",
    });
    if (audioFileRef.current) {
      audioFileRef.current.value = "";
    }
  };

  const handleMultiSelect = (
    field: "genreIds" | "hosts" | "guests",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((id) => id !== value)
        : [...prev[field], value],
    }));
  };

  if (isLoadingData) {
    return <div className="p-6">загрузка данных...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            передача *
          </label>
          <select
            required
            value={formData.programId}
            onChange={(e) =>
              setFormData({ ...formData, programId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Выберите программу</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            название выпуска *
          </label>
          <input
            type="text"
            required
            value={formData.episodeTitle}
            onChange={(e) =>
              setFormData({ ...formData, episodeTitle: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            тип *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as "live" | "podcast",
              })
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="live">прямой эфир</option>
            <option value="podcast">подкаст</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            дата выхода *
          </label>
          <input
            type="date"
            required
            value={formData.releaseDate.toISOString().slice(0, 10)}
            onChange={(e) =>
              setFormData({
                ...formData,
                releaseDate: new Date(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            cтатус
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "published" | "hidden",
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="published">опубликовано</option>
            <option value="hidden">скрыто</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          аудиофайл (mp3) *
        </label>
        {!formData.fileUrl && (
          <input
            ref={audioFileRef}
            type="file"
            required
            accept=".mp3,audio/mpeg"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await handleFileUpload(file);
              }
            }}
            disabled={isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
        {isUploading && (
          <p className="text-sm text-primary/60 mt-1">загрузка файла...</p>
        )}
        {formData.fileUrl && (
          <p className="text-sm text-primary mt-1">✓ файл загружен</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ключевые слова
        </label>
        <input
          type="text"
          value={formData.keywords}
          onChange={(e) =>
            setFormData({ ...formData, keywords: e.target.value })
          }
          placeholder="ключевые слова через запятую"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            жанры
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
            {genres.map((genre) => (
              <label key={genre.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.genreIds.includes(genre.id)}
                  onChange={() => handleMultiSelect("genreIds", genre.id)}
                  className="mr-2"
                />
                <span className="text-sm">{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ведущие
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
            {people.map((person) => (
              <label key={person.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hosts.includes(person.id)}
                  onChange={() => handleMultiSelect("hosts", person.id)}
                  disabled={formData.guests.includes(person.id)}
                  className="mr-2"
                />
                <span
                  className={`text-sm ${
                    formData.guests.includes(person.id) ? "text-gray-400" : ""
                  }`}
                >
                  {person.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            гости
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
            {people.map((person) => (
              <label key={person.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.guests.includes(person.id)}
                  onChange={() => handleMultiSelect("guests", person.id)}
                  disabled={formData.hosts.includes(person.id)}
                  className="mr-2"
                />
                <span
                  className={`text-sm ${
                    formData.hosts.includes(person.id) ? "text-gray-400" : ""
                  }`}
                >
                  {person.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isUploading || isPending}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50"
        >
          {editingId ? "обновить" : "создать"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 rounded bg-white text-secondary border border-gray-200 font-semibold hover:bg-gray-50 hover:text-secondary-hover transition-colors shadow-sm hover:shadow"
        >
          отмена
        </button>
        &nbsp;
        {(isUploading || isPending) && (
          <div className="rounded-full h-4 w-4 border-b-2 border-primary animate-spin "></div>
        )}
      </div>
    </form>
  );
}
