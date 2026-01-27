import { retrieveDataFromExcalidraw, retrieveExcalidrawFilesFrom } from './compute'

describe("Detecting Excalidraw files", () => {
    test('should retrieve 10 Excalidraw files from test directory', async () => {
        const excalidrawFiles = await retrieveExcalidrawFilesFrom('test')
        expect(excalidrawFiles).toBeTruthy()
        expect(excalidrawFiles?.length).toBe(10)
    })
})

describe("Parsing Excalidraw files", () => {
    test('should retrieve data from existing file with excalidraw type', async () => {
        const data = await retrieveDataFromExcalidraw('./test/foo/circle.excalidraw')
        expect(data).toBeTruthy()
        expect(data?.type).toBe("excalidraw")
    })
})