"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import AddButton from "@/components/add-button";
import { getGenres, createGenre, deleteGenre } from "@/lib/actions";
import type { Genre } from "@/db/schema";

export function GenresManager() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newGenreName, setNewGenreName] = useState("");

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
            className="flex-1 px-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <AddButton
            type="submit"
            disabled={!newGenreName || isPending}
            style={{ opacity: !newGenreName || isPending ? 0.5 : 1 }}
          />
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
          >
            <span className="text-sm font-medium">{genre.name}</span>
            <button
              onClick={() => handleDelete(genre.id)}
              className="text-red-600 hover:text-red-800 text-sm ml-2 disabled:opacity-50"
              disabled={isPending}
            >
              ×
            </button>
          </div>
        ))}
        {genres.length === 0 && (
          <div className="col-span-full">
            <p className="text-gray-500 text-center py-8">жанры не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
