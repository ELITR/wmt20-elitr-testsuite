import { AnnotationDocument, DocumentMap } from './document_manager'
import * as $ from 'jquery'
import { DEVMODE } from './main'

const FILES: Array<string> = ['doc1.xml', 'doc2.xml']
const MTS: Array<string> = ['base']
export { FILES, MTS }

export class DocumentLoader {
    private static baseURL: string = DEVMODE ? 'example_docs/' : 'example_docs/'

    public static async load(): Promise<DocumentMap> {
        let promises: Array<Promise<[string, AnnotationDocument]>> = FILES.map(
            (filename: string) =>
                new Promise<[string, AnnotationDocument]>(async (resolve, reject) => {
                    await $.ajax({
                        url: DocumentLoader.baseURL + MTS[0] + '_' + filename,
                        dataType: 'text',
                        success: (text: string) => {
                            resolve([filename, new AnnotationDocument(text)])
                        },
                    })
                })
        )

        let files: DocumentMap = new Map<string, AnnotationDocument>(await Promise.all(promises))
        this.assertLoaded(files)
        return files
    }

    private static assertLoaded(files: DocumentMap): boolean {
        let loaded = new Set(files.keys())

        for (let filename of FILES) {
            if (!loaded.has(filename)) {
                throw new Error(`${filename} not loaded.`)
            }
        }
        return true
    }
}