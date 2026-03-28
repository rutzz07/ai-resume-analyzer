// src/lib/utils.ts

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

export const generateUUID = ()=> crypto.randomUUID();