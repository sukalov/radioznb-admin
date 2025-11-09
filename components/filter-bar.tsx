"use client";

import { usePathname } from "next/navigation";
import { useFilters } from "@/contexts/filter-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, User, UserX, Send, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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

  // Sort programs alphabetically by name
  const sortedPrograms = useMemo(() => {
    return [...programs].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [programs]);

  if (!activeTab) {
    return null;
  }

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <TooltipProvider>
          <div className="flex flex-wrap gap-3 w-fit mx-auto">
            {/* Search input - common for all pages */}
            <div className="flex-1 min-w-[180px] max-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="поиск..."
                value={filters.searchQuery}
                onChange={(e) =>
                  updateFilters({
                    searchQuery: e.target.value,
                  })
                }
                className="w-full pl-9"
              />
            </div>

            {/* Sort select - common for all pages */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                updateFilters({ sortBy: value as typeof filters.sortBy })
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">имя (А-Я)</SelectItem>
                <SelectItem value="name-desc">имя (Я-А)</SelectItem>
                <SelectItem value="date-asc">дата (старые)</SelectItem>
                <SelectItem value="date-desc">дата (новые)</SelectItem>
              </SelectContent>
            </Select>

            {/* Programs-specific filters */}
            {activeTab === "programs" && (
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="sm"
                value={[
                  ...(filters.programsWithHost ? ["with-host"] : []),
                  ...(filters.programsWithoutHost ? ["without-host"] : []),
                ]}
                onValueChange={(values) => {
                  updateFilters({
                    programsWithHost: values.includes("with-host"),
                    programsWithoutHost: values.includes("without-host"),
                  });
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="with-host"
                      aria-label="с ведущим"
                      className={`${
                        filters.programsWithHost ? "border-primary" : ""
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>с ведущим</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="without-host"
                      aria-label="без ведущего"
                      className={`${
                        filters.programsWithoutHost ? "border-primary" : ""
                      }`}
                    >
                      <UserX className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>без ведущего</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            )}

            {/* People-specific filters */}
            {activeTab === "people" && (
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="sm"
                value={[
                  ...(filters.peopleWithTelegram ? ["with-telegram"] : []),
                  ...(filters.peopleWithoutTelegram
                    ? ["without-telegram"]
                    : []),
                ]}
                onValueChange={(values) => {
                  updateFilters({
                    peopleWithTelegram: values.includes("with-telegram"),
                    peopleWithoutTelegram: values.includes("without-telegram"),
                  });
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="with-telegram"
                      aria-label="с телеграмом"
                      className={`${
                        filters.peopleWithTelegram ? "border-primary" : ""
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>с телеграмом</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="without-telegram"
                      aria-label="без телеграма"
                      className={`${
                        filters.peopleWithoutTelegram ? "border-primary" : ""
                      }`}
                    >
                      <div className="relative">
                        <Send className="h-4 w-4" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-[1.8px] rounded-full bg-current rotate-45 translate-x-[1px] -translate-y-[1px]" />
                        </div>
                      </div>
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>без телеграма</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            )}

            {/* Recordings-specific filters */}
            {activeTab === "recordings" && (
              <>
                <Select
                  value={filters.recordingType}
                  onValueChange={(value) =>
                    updateFilters({
                      recordingType: value as typeof filters.recordingType,
                    })
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">все типы</SelectItem>
                    <SelectItem value="live">прямой эфир</SelectItem>
                    <SelectItem value="podcast">подкаст</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.recordingStatus}
                  onValueChange={(value) =>
                    updateFilters({
                      recordingStatus: value as typeof filters.recordingStatus,
                    })
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">все статусы</SelectItem>
                    <SelectItem value="published">опубликовано</SelectItem>
                    <SelectItem value="hidden">скрыто</SelectItem>
                  </SelectContent>
                </Select>

                {programs.length > 0 && (
                  <Select
                    value={filters.selectedPrograms[0] || "all"}
                    onValueChange={(value) =>
                      updateFilters({
                        selectedPrograms: value === "all" ? [] : [value],
                      })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[400px]">
                        <SelectItem value="all">все передачи</SelectItem>
                        {sortedPrograms.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                )}

                {genres.length > 0 && (
                  <Select
                    value={filters.selectedGenres[0] || "all"}
                    onValueChange={(value) =>
                      updateFilters({
                        selectedGenres: value === "all" ? [] : [value],
                      })
                    }
                  >
                    <SelectTrigger className="w-[130px]">
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
                )}
              </>
            )}

            {/* Reset button - always on the right */}
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="whitespace-nowrap flex items-center justify-center align-middle"
              >
                <X />
                сбросить фильтры
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
