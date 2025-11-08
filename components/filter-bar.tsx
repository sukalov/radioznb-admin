"use client";

import { usePathname } from "next/navigation";
import { useFilters } from "@/contexts/filter-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getGenres, getPrograms } from "@/lib/actions";
import type { Genre, Program } from "@/db/schema";

type Tab = "programs" | "people" | "recordings" | "genres";

export function FilterBar() {
  const pathname = usePathname();
  const activeTab = pathname.split("/")[1] as Tab;
  const { filters, updateFilters, resetFilters } = useFilters();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Load genres and programs for recordings page
  useEffect(() => {
    if (activeTab === "recordings") {
      Promise.all([getGenres(), getPrograms()]).then(
        ([genresRes, programsRes]) => {
          if (genresRes.success) setGenres(genresRes.data!);
          if (programsRes.success) setPrograms(programsRes.data!);
        }
      );
    }
  }, [activeTab]);

  // Don't show filter bar on home page or login
  if (!activeTab) {
    return null;
  }

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search input - common for all pages */}
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="поиск..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Sort select - common for all pages */}
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">сортировка:</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                updateFilters({ sortBy: value as typeof filters.sortBy })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">имя (А-Я)</SelectItem>
                <SelectItem value="name-desc">имя (Я-А)</SelectItem>
                <SelectItem value="date-asc">дата (старые)</SelectItem>
                <SelectItem value="date-desc">дата (новые)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Programs-specific filters */}
          {activeTab === "programs" && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="with-host"
                  checked={filters.programsWithHost}
                  onCheckedChange={(checked) =>
                    updateFilters({ programsWithHost: checked as boolean })
                  }
                />
                <Label htmlFor="with-host" className="text-sm cursor-pointer">
                  с ведущим
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="without-host"
                  checked={filters.programsWithoutHost}
                  onCheckedChange={(checked) =>
                    updateFilters({ programsWithoutHost: checked as boolean })
                  }
                />
                <Label
                  htmlFor="without-host"
                  className="text-sm cursor-pointer"
                >
                  без ведущего
                </Label>
              </div>
            </>
          )}

          {/* People-specific filters */}
          {activeTab === "people" && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="with-telegram"
                  checked={filters.peopleWithTelegram}
                  onCheckedChange={(checked) =>
                    updateFilters({ peopleWithTelegram: checked as boolean })
                  }
                />
                <Label
                  htmlFor="with-telegram"
                  className="text-sm cursor-pointer"
                >
                  с телеграмом
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="without-telegram"
                  checked={filters.peopleWithoutTelegram}
                  onCheckedChange={(checked) =>
                    updateFilters({ peopleWithoutTelegram: checked as boolean })
                  }
                />
                <Label
                  htmlFor="without-telegram"
                  className="text-sm cursor-pointer"
                >
                  без телеграма
                </Label>
              </div>
            </>
          )}

          {/* Recordings-specific filters */}
          {activeTab === "recordings" && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">тип:</Label>
                <Select
                  value={filters.recordingType}
                  onValueChange={(value) =>
                    updateFilters({
                      recordingType: value as typeof filters.recordingType,
                    })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">все</SelectItem>
                    <SelectItem value="live">прямой эфир</SelectItem>
                    <SelectItem value="podcast">подкаст</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">статус:</Label>
                <Select
                  value={filters.recordingStatus}
                  onValueChange={(value) =>
                    updateFilters({
                      recordingStatus: value as typeof filters.recordingStatus,
                    })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">все</SelectItem>
                    <SelectItem value="published">опубликовано</SelectItem>
                    <SelectItem value="hidden">скрыто</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {programs.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">передача:</Label>
                  <Select
                    value={filters.selectedPrograms[0] || "all"}
                    onValueChange={(value) =>
                      updateFilters({
                        selectedPrograms: value === "all" ? [] : [value],
                      })
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">все передачи</SelectItem>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {genres.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">жанр:</Label>
                  <Select
                    value={filters.selectedGenres[0] || "all"}
                    onValueChange={(value) =>
                      updateFilters({
                        selectedGenres: value === "all" ? [] : [value],
                      })
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">все жанры</SelectItem>
                      {genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.id}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {/* Reset button - always on the right */}
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-1" />
              сбросить фильтры
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
