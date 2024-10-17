import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const downloadJson = (
  data: any,
  filename: string,
  callback?: (success: boolean) => void
) => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `${filename}.json`;

  a.onclick = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (callback) {
        // Check if the file was downloaded successfully
        const downloadSuccess = document.body.contains(a);
        callback(downloadSuccess);
      }
    }, 100);
  };

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
