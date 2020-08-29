import { Storage } from "aws-amplify";

export async function s3Upload(file) {
    const filename = `${Date.now()}-${file.name}`;

    const stored = await Storage.put(filename, file, {
        contentType: file.type
    });

    return stored.key;
}

export async function s3UploadBulk(files) {

    let fileNames = [];

    for (var i = 0; i < files.length; i++) {

        const filename = `${Date.now()}-${files[i].name}`;

        const stored = await Storage.put(filename, files[i], {
            contentType: files[i].type
        });

        fileNames.push(stored.key);

    }

    return fileNames;

}