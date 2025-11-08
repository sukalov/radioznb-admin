"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
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
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useFilters } from "@/contexts/filter-context";

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
  const user = useSession({ required: true });
  const { filters } = useFilters();

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

  // Apply filters and sorting
  const filteredPeople = useMemo(() => {
    let result = [...people];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (person) =>
          person.name.toLowerCase().includes(query) ||
          person.telegramAccount?.toLowerCase().replace("ё", "е").includes(query)
      );
    }

    // Telegram filters (inverted logic: ON = exclude, OFF = include)
    // If both are OFF, show nothing
    if (!filters.peopleWithTelegram && !filters.peopleWithoutTelegram) {
      result = [];
    } else if (!filters.peopleWithTelegram) {
      // Exclude people with telegram
      result = result.filter((person) => !person.telegramAccount);
    } else if (!filters.peopleWithoutTelegram) {
      // Exclude people without telegram
      result = result.filter((person) => person.telegramAccount);
    }
    // If both are ON, show all (no filtering)

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name, "ru");
        case "name-desc":
          return b.name.localeCompare(a.name, "ru");
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [people, filters]);

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
              <Button variant="default" disabled={isPending}>
                {editingId ? "обновить" : "создать"}
              </Button>
              <Button variant="outline" type="button" onClick={handleCancel}>
                отмена
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map((person) => (
          <div key={person.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{person.name}</h3>
              <div className="flex space-x-3 ml-4">
                <button
                  onClick={() => handleEdit(person)}
                  className="text-primary hover:text-primary/80 text-sm"
                  disabled={isPending}
                >
                  <Edit />
                </button>
                {user.data?.user.role === "admin" && (
                  <button
                    onClick={() => handleDelete(person.id)}
                    className="text-destructive hover:text-destructive/80 text-sm disabled:opacity-50"
                    disabled={isPending}
                  >
                    <Trash />
                  </button>
                )}
              </div>
            </div>
            {person.telegramAccount && (
              <p className="text-muted-foreground text-sm">
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
        {filteredPeople.length === 0 && (
          <div className="col-span-full">
            <p className="text-muted-foreground text-center py-8">
              {people.length === 0
                ? "пусто"
                : "нет людей, соответствующих фильтрам"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
