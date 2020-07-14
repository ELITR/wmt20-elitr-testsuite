import * as $ from 'jquery'
import { DEVMODE } from '../main'
import { DocSrc, DocTgt } from '../documents/document'
import { PageUtils } from '../misc/page_utils'

export interface UserIntroSync {
    queue_doc: string[],
    queue_mkb: Map<string, string[]>,
    mts: string[],
    content_src: Map<string, DocSrc>,
    content_mt: Map<string, Map<string, DocTgt>>,
    rating: { [signature: string]: { [mt: string]: any } },
}

export class UserProgress {
    constructor(
        public doc: number,
        public mkb: number,
        public sec: number,
    ) { }

    public finished(): boolean {
        return this.doc == -1 && this.mkb == -1 && this.sec == -1
    }

    public clone(): UserProgress {
        return new UserProgress(this.doc, this.mkb, this.sec)
    }
}

export class DocumentLoader {
    public static async load(AID: string): Promise<[UserIntroSync, UserProgress]> {
        let convertRaw = (data: any): UserIntroSync => {
            return {
                queue_doc: data.queue_doc,
                queue_mkb: new Map<string, string[]>(Object.keys(data.queue_mkb).map(
                    (key: string) => [key, data.queue_mkb[key]]
                )),
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
                )),
                rating: data.ratings
            }
        }

        let data = await $.ajax({
            method: 'POST',
            url: PageUtils.baseURL + 'login_p2',
            data: JSON.stringify({ 'AID': AID }),
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: (data: any) => {
                return data
            },
            error: (text) => {
                alert('Error syncing with server. Is it up?')
                throw new Error(`${PageUtils.baseURL} download sync error`)
            }
        })
        return [convertRaw(data), new UserProgress(data.progress.doc, data.progress.mkb, data.progress.sec)]
    }
}