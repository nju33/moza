import * as glob from 'glob';

export const pglob = (pattern: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, filenames) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(filenames);
      }
    });
  });
};
