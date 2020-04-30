import { DocTgtArray, DocSrcArray } from './document_manager'
import * as $ from 'jquery'
import { DEVMODE } from '../main'
import { DocSrc, DocTgt } from './document'

const FILES: Array<string> = ['doc1', 'doc2']
const MTS: Array<string> = ['google', 'bing', 'lindat']
// export { FILES, MTS }

export type MTS = Array<string>
export type FILES = Array<string>

export interface UserIntroSync {
    queue_doc: string[],
    queue_mkb: Map<string, string[]>,
    mts: string[],
    content_src: Map<string, DocSrc>,
    content_mt: Map<string, Map<string, DocTgt>>,
}
export interface UserIntroRaw {
    queue_doc: string[],
    queue_mkb: Map<string, string[]>,
    mts: string[],
    content_src: { [key: string]: string },
    content_mt: { [doc: string]: { [tgt: string]: string } },
}

export class DocumentLoader {
    private static baseURL: string = DEVMODE ? 'example_docs/' : 'example_docs/'

    public static async load(AID: string): Promise<UserIntroSync> {
        let data: UserIntroRaw = require('./local_debug_response.json')
        let convertRaw : (data:UserIntroRaw) => UserIntroSync = (data: UserIntroRaw) => {
            return {
                queue_doc: data.queue_doc,
                queue_mkb: data.queue_mkb,
                mts: data.mts,
                content_src: new Map<string, DocSrc>(Object.keys(data.content_src).map(
                    (key: string) => [key, new DocSrc(data.content_src[key])]
                )),
                content_mt: new Map<string, Map<string, DocTgt>>(Object.keys(data.content_mt).map(
                    (docKey: string) => [
                        docKey,
                        new Map<string, DocTgt>(Object.keys(data.content_mt[docKey]).map(
                            (tgtKey: string) => [tgtKey, new DocTgt(data.content_mt[docKey][tgtKey])]
                        ))
                    ]
                ))
            }
        }
        return convertRaw(data)

        // await $.ajax({
        //     url: DocumentLoader.baseURL,
        //     dataType: 'text',
        //     data: { 'AID': AID },
        //     success: (data: UserIntroSync) => {
        //         return data
        //     },
        //     error: (text) => {
        //         throw new Error(`${DocumentLoader.baseURL} download sync error`)
        //     }
        // })

        // return
        // let promisesTgt: Array<Promise<[string, DocTgt]>> = []
        // for (let filename of FILES) {
        //     for (let mt of MTS) {
        //         let promise = new Promise<[string, DocTgt]>(async (resolve, reject) => {
        //             await $.ajax({
        //                 url: DocumentLoader.baseURL + filename + '_' + mt + '.xml',
        //                 dataType: 'text',
        //                 success: (text: string) => {
        //                     resolve([filename + '_' + mt, new DocTgt(text)])
        //                 },
        //                 error: (text) => {
        //                     reject(`${DocumentLoader.baseURL}${filename}_${mt}.xml download error`)
        //                 }
        //             })
        //         })
        //         promisesTgt.push(promise)
        //     }
        // }

        // let promisesSrc: Array<Promise<[string, DocSrc]>> = []
        // for (let filename of FILES) {
        //     let promise = new Promise<[string, DocSrc]>(async (resolve, reject) => {
        //         await $.ajax({
        //             url: DocumentLoader.baseURL + filename + '_src.xml',
        //             dataType: 'text',
        //             success: (text: string) => {
        //                 resolve([filename, new DocSrc(text)])
        //             },
        //             error: (text) => {
        //                 reject(`${DocumentLoader.baseURL}${filename}_src.xml download error`)
        //             }
        //         })
        //     })
        //     promisesSrc.push(promise)
        // }

        // let filesTgt: DocTgtArray = await Promise.all(promisesTgt)
        // let filesSrc: DocSrcArray = await Promise.all(promisesSrc)
        // this.assertLoaded(filesTgt, filesSrc)
        // return [filesTgt, filesSrc]
    }

    private static assertLoaded(filesTgt: DocTgtArray, filesSrc: DocSrcArray): boolean {
        let isLoadedTgt = (key: string) => filesTgt.some(([keyArr, _]) => keyArr == key)
        let isLoadedSrc = (key: string) => filesSrc.some(([keyArr, _]) => keyArr == key)

        for (let filename of FILES) {
            for (let mt of MTS) {
                if (!isLoadedTgt(filename + '_' + mt)) {
                    throw new Error(`${filename} not loaded.`)
                }
            }
        }

        for (let filename of FILES) {
            if (!isLoadedSrc(filename)) {
                throw new Error(`${filename} source not loaded.`)
            }
        }

        return true
    }
}