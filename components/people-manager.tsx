"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import {
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
} from "@/lib/actions";
import type { Person } from "@/db/schema";
import AddButton from "@/components/add-button";

export function PeopleManager() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    telegramAccount: "",
  });

  const loadPeople = async () => {
    setIsLoading(true);
    try {
      const result = await getPeople();
      if (result.success) {
        setPeople(result.data!);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeople();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        // process telegram account - remove @ if present
        const telegramAccount = formData.telegramAccount.replace(/^@/, "");

        if (editingId) {
          const result = await updatePerson(editingId, {
            name: formData.name,
            telegramAccount: telegramAccount || null,
          });

          if (result.success) {
            toast.success("обновили");
            setEditingId(null);
            setIsCreating(false);
            await loadPeople();
          } else {
            toast.error(result.error);
          }
        } else {
          const result = await createPerson({
            name: formData.name,
            telegramAccount: telegramAccount || undefined,
          });

          if (result.success) {
            toast.success("добавили");
            setIsCreating(false);
            await loadPeople();
          } else {
            toast.error(result.error);
          }
        }
        setFormData({ name: "", telegramAccount: "" });
      } catch (error) {
        console.log(error);
        toast.error("не удалось сохранить изменения");
      }
    });
  };

  const handleEdit = (person: Person) => {
    setEditingId(person.id);
    setFormData({
      name: person.name,
      telegramAccount: person.telegramAccount || "",
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("вы уверены, что хотите удалить этого человека?")) {
      startTransition(async () => {
        try {
          const result = await deletePerson(id);
          if (result.success) {
            toast.success("человек удален");
            await loadPeople();
          } else {
            toast.error(result.error);
          }
        } catch (error) {
          console.log(error);
          toast.error("не удалось удалить человека");
        }
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", telegramAccount: "" });
  };

  const getTelegramUrl = (username: string) => {
    return `https://t.me/${username}`;
  };

  if (isLoading) {
    return <div className="p-6">загрузка людей...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold pl-4">люди (ведущие и гости)</h2>
        {!isCreating && <AddButton onClick={() => setIsCreating(true)} />}
      </div>

      {isCreating && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            {editingId ? "редактор" : "добавить ведущего или гостя"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                имя *
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
                аккаунт в телеграме
              </label>
              <input
                type="text"
                value={formData.telegramAccount}
                onChange={(e) =>
                  setFormData({ ...formData, telegramAccount: e.target.value })
                }
                placeholder="username (без @)"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => (
          <div key={person.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{person.name}</h3>
              <div className="flex space-x-3 ml-4">
                <button
                  onClick={() => handleEdit(person)}
                  className="text-primary hover:text-primary-hover/80 text-sm"
                  disabled={isPending}
                >
                  <Edit />
                </button>
                <button
                  onClick={() => handleDelete(person.id)}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  disabled={isPending}
                >
                  <Trash />
                </button>
              </div>
            </div>
            {person.telegramAccount && (
              <p className="text-gray-600 text-sm">
                <a
                  href={getTelegramUrl(person.telegramAccount)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover/80"
                >
                  @{person.telegramAccount}
                </a>
              </p>
            )}
          </div>
        ))}
        {people.length === 0 && (
          <div className="col-span-full">
            <p className="text-secondary text-center py-8">
              добавьте своего первого ведущего или гостя!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
