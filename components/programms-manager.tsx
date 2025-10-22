"use client";

import { generateSlug } from "@/lib/utils";
import { Edit, Trash } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import AddButton from "@/components/add-button";
import {
  getPrograms,
  getPeople,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/lib/actions";
import type { Program, Person } from "@/db/schema";

type ProgramWithHost = Program & {
  host?: Person;
};

export function ProgramsManager() {
  const [programs, setPrograms] = useState<ProgramWithHost[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hostId: "",
    slug: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [programsRes, peopleRes] = await Promise.all([
        getPrograms(),
        getPeople(),
      ]);

      if (programsRes.success) {
        setPrograms(programsRes.data!);
      } else {
        toast.error(programsRes.error);
      }

      if (peopleRes.success) {
        setPeople(peopleRes.data!);
      } else {
        toast.error(peopleRes.error);
      }
    } catch (error) {
      toast.error("не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingId) {
          const result = await updateProgram(editingId, {
            name: formData.name,
            description: formData.description || null,
            hostId: formData.hostId || null,
            slug: formData.slug || generateSlug(formData.name),
          });

          if (result.success) {
            toast.success("передача обновлена");
            setEditingId(null);
            setIsCreating(false);
            await loadData();
          } else {
            toast.error(result.error);
          }
        } else {
          const result = await createProgram({
            name: formData.name,
            description: formData.description || undefined,
            hostId: formData.hostId || undefined,
            slug: formData.slug || generateSlug(formData.name),
          });

          if (result.success) {
            toast.success("передача создана успешно");
            setIsCreating(false);
            await loadData();
          } else {
            toast.error(result.error);
          }
        }
        setFormData({ name: "", description: "", hostId: "", slug: "" });
      } catch (error) {
        console.log(error);
        toast.error("не удалось сохранить передачу");
      }
    });
  };

  const handleEdit = (program: ProgramWithHost) => {
    setEditingId(program.id);
    setFormData({
      name: program.name,
      description: program.description || "",
      hostId: program.hostId || "",
      slug: program.slug || generateSlug(program.name),
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("вы уверены, что хотите удалить эту передачу?")) {
      startTransition(async () => {
        try {
          const result = await deleteProgram(id);
          if (result.success) {
            toast.success("передача удалена");
            await loadData();
          } else {
            toast.error(result.error);
          }
        } catch (error) {
          console.log(error);
          toast.error("не удалось удалить передачу");
        }
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", description: "", hostId: "", slug: "" });
  };

  if (isLoading) {
    return <div className="p-6">загрузка передач...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold pl-4">передачи</h2>
        {!isCreating && <AddButton onClick={() => setIsCreating(true)} />}
      </div>
      {isCreating && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            {editingId ? "редактор" : "новая передача"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                название *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                постоянный ведущий
              </label>
              <select
                value={formData.hostId}
                onChange={(e) =>
                  setFormData({ ...formData, hostId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">выберите ведущего (необязательно)</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
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
                короткий адрес страницы
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder={generateSlug(formData.name)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isPending}
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
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {programs.map((program) => (
          <div key={program.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium">{program.name}</h3>
                {program.host && (
                  <p className="text-gray-600 mt-1">
                    ведущий: {program.host.name}
                  </p>
                )}
                {program.description && (
                  <p className="text-gray-600 mt-1">{program.description}</p>
                )}
              </div>
              <div className="flex space-x-3 ml-4">
                <button
                  onClick={() => handleEdit(program)}
                  className="text-primary hover:text-primary-hover/80"
                  disabled={isPending}
                >
                  <Edit />
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  disabled={isPending}
                >
                  <Trash />
                </button>
              </div>
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            программы не найдены. создайте свою первую программу!
          </p>
        )}
      </div>
    </div>
  );
}
