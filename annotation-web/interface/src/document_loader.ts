import { AnnotationDocument, DocumentArray } from './document_manager'
import * as $ from 'jquery'
import { DEVMODE } from './main'

const FILES: Array<string> = ['doc1', 'doc2']
const MTS: Array<string> = ['google', 'bing', 'lindat']
export { FILES, MTS }

export class DocumentLoader {
    private static baseURL: string = DEVMODE ? 'example_docs/' : 'example_docs/'

    public static async load(): Promise<DocumentArray> {
        let promises: Array<Promise<[string, AnnotationDocument]>> = []

        for (let filename of FILES) {
            for (let mt of MTS) {
                let promise = new Promise<[string, AnnotationDocument]>(async (resolve, reject) => {
                    await $.ajax({
                        url: DocumentLoader.baseURL + filename + '_' + mt + '.xml',
                        dataType: 'text',
                        success: (text: string) => {
                            resolve([filename + '_' + mt, new AnnotationDocument(text)])
                        },
                    })
                })
                promises.push(promise)
            }
        }

        let files: DocumentArray = await Promise.all(promises)
        this.assertLoaded(files)
        return files
    }

    private static assertLoaded(files: DocumentArray): boolean {
        let isLoaded = (key: string) => files.some(([keyArr, _]) => keyArr == key)

        for (let filename of FILES) {
            for (let mt of MTS) {
                if (!isLoaded(filename + '_' + mt)) {
                    throw new Error(`${filename} not loaded.`)
                }
            }
        }
        return true
    }
}