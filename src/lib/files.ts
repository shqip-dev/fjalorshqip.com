import fs from 'fs/promises';
import path from 'path';

export const readJson = async <T>(filename: string): Promise<T> => {
  const content = await fs.readFile(filename, 'utf-8');
  return JSON.parse(content);
};

export const writeJson = async <T>(
  filename: string,
  content: T,
  options: { createDir?: boolean; pretty?: boolean } = {}
) => {
  const dir = path.dirname(filename);
  if (!!options.createDir && !!dir) {
    await fs.mkdir(dir, { recursive: true });
  }
  const stringifiedContent = options.pretty
    ? JSON.stringify(content, null, 2)
    : JSON.stringify(content);

  await fs.writeFile(filename, stringifiedContent);
};

export const getFileNames = async (dir: string): Promise<string[]> => {
  const objs = await fs.readdir(dir);

  const responses = await Promise.all(
    objs.map(async (obj) => {
      const stats = await fs.stat(path.join(dir, obj));
      return {
        isFile: stats.isFile(),
        name: obj,
      };
    })
  );

  return responses
    .filter((response) => response.isFile)
    .map((response) => response.name);
};
