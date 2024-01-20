import * as fs from 'fs/promises';
import * as path from 'path';

const readJson = async <T>(filename: string): Promise<T> => {
  const content = await fs.readFile(filename, 'utf-8');
  return JSON.parse(content);
};

const writeJson = async <T>(
  filename: string,
  content: T,
  options: { createDir?: boolean; pretty?: boolean } = {}
) => {
  const dirname = path.dirname(filename);
  if (!!options.createDir && !!dirname) {
    await fs.mkdir(dirname, { recursive: true });
  }
  const stringifiedContent = options.pretty
    ? JSON.stringify(content, null, 2)
    : JSON.stringify(content);

  await fs.writeFile(filename, stringifiedContent);
};

export default {
  readJson,
  writeJson,
};
