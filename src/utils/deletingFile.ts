import fs from 'fs/promises';
export const DeleteFile = (path:string) => {
fs.unlink(path)
		.catch((e) => {
			throw new Error(`Could not delete file ${path}`);
		});
};