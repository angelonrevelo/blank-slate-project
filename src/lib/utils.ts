import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Map full branch names to shorter display names
export function getBranchDisplayName(fullBranchName: string): string {
  const branchMap: Record<string, string> = {
    'VBE Eye Center - Quezon City': 'Quezon City',
    'VBE Eye Center - Tanauan City': 'Tanauan City',
  };
  return branchMap[fullBranchName] || fullBranchName;
}
