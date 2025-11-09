"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getGenres, createGenre, deleteGenre } from "@/lib/actions";
import type { Genre } from "@/db/schema";
import { Card } from "./ui/card";
import { useSession } from "next-auth/react";
import { useFilters } from "@/contexts/filter-context";

export function GenresManager() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newGenreName, setNewGenreName] = useState("");
  const user = useSession({ required: true });
  const { filters } = useFilters();

  const loadGenres = async () => {
    setIsLoading(true);
    try {
      const result = await getGenres();
      if (result.success) {
        setGenres(result.data!);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGenreName.trim()) return;

    startTransition(async () => {
      try {
        const result = await createGenre({ name: newGenreName.trim() });
        if (result.success) {
          toast.success("жанр добавлен");
          setNewGenreName("");
          await loadGenres();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.log(error);
        toast.error("не удалось добавить жанр. возможно, он уже существует");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("вы уверены, что хотите удалить этот жанр?")) {
      startTransition(async () => {
        try {
          const result = await deleteGenre(id);
          if (result.success) {
            toast.success("жанр удален");
            await loadGenres();
          } else {
            toast.error(result.error);
          }
        } catch (error) {
          console.log(error);
          toast.error("не удалось удалить жанр");
        }
      });
    }
  };

  // Apply filters and sorting
  const filteredGenres = useMemo(() => {
    let result = [...genres];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase().replace(/[^а-я]/g, "").replace("ё", "е");
      result = result.filter((genre) =>
        genre.name.toLowerCase().replace("ё", "е").replace(/[^а-я]/g, "").includes(query),
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name, "ru");
        case "name-desc":
          return b.name.localeCompare(a.name, "ru");
        case "date-asc":
        case "date-desc":
          // Genres don't have dates, fallback to name sorting
          return a.name.localeCompare(b.name, "ru");
        default:
          return a.name.localeCompare(b.name, "ru");
      }
    });

    return result;
  }, [genres, filters]);

  if (isLoading) {
    return <div className="p-6">загрузка жанров...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 pl-4">жанры</h2>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <Input
            type="text"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="новый жанр"
            className="flex-1"
          />
          <Button type="submit" disabled={!newGenreName || isPending}>
            добавить
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredGenres.map((genre) => (
          <Card
            key={genre.id}
            className="flex items-center justify-between pl-5 pr-3 py-2"
          >
            <span className="text-sm font-medium">{genre.name}</span>
            {user.data?.user.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(genre.id)}
                className="text-destructive hover:text-destructive text-sm ml-2 disabled:opacity-50"
                disabled={isPending}
              >
                ×
              </Button>
            )}
          </Card>
        ))}
        {filteredGenres.length === 0 && (
          <div className="col-span-full">
            <p className="text-gray-500 text-center py-8">
              {genres.length === 0
                ? "жанры не найдены"
                : "нет жанров, соответствующих фильтрам"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
