import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(input: string, maxLength = 32): string {
  const cyrillicMap: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ы: 'y',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    ь: '',
    ъ: '',
  }

  // Convert to lowercase and transliterate Cyrillic to Latin
  let slug = input
    .toLowerCase()
    .split('')
    .map((ch) => cyrillicMap[ch] ?? ch)
    .join('')

  // Normalize and clean up
  slug = slug
    .normalize('NFD') // decompose accents
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric (Latin only) with "-"
    .replace(/^-+|-+$/g, '') // trim edges
    .slice(0, maxLength)
    .replace(/-+$/g, '') // ensure no trailing hyphen

  return slug
}
