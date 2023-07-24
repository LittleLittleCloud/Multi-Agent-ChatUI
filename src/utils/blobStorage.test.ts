import { TestBlobStorage } from "./blobStorage";

test('test blob storage', async () => {
        const blob = new Blob(["test"]);
        const name = "test";
        const testBlobStorage = await TestBlobStorage;
        await testBlobStorage.saveBlob(blob, name);
        const result = await testBlobStorage.getBlob(name);
        expect(result).toEqual(blob);
        const isExist = await testBlobStorage.isBlobExist(name);
        expect(isExist).toEqual(true);
        const list = await testBlobStorage.listBlobs();
        expect(list).toEqual([name]);
        await testBlobStorage.deleteBlob(name);
        const isExist2 = await testBlobStorage.isBlobExist(name);
        expect(isExist2).toEqual(false);
        const list2 = await testBlobStorage.listBlobs();
        expect(list2).toEqual([]);
    }
);