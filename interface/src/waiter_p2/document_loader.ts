import * as $ from 'jquery'
import { BASEURL } from '../main'
import { DocSrc, DocTgt } from '../misc/document'
import { RatingDatabase } from './model'

export interface UserIntroSync {
    queue_doc: Readonly<Array<string>>,
    queue_mkb: Readonly<Map<string, Array<string>>>,
    names_mt: Readonly<Array<string>>,
    content_src: Readonly<Map<string, DocSrc>>,
    content_mt: Readonly<Map<string, Map<string, DocTgt>>>,
    rating: RatingDatabase,
}

export class UserProgress {
    constructor(
        public doc: number,
        public mkb: number,
        public sec: number,
    ) { }

    public beginning() : boolean {
        return this.doc == 0 && this.mkb == 0 && this.sec == 0
    }

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
                names_mt: data.names_mt,
                content_src: new Map<string, DocSrc>(Object.keys(data.content_src).map(
                    (docName: string) => [
                        docName, 
                        new DocSrc(
                            data.content_src[docName],
                            new Map<string, Array<[number, number]>>(
                                Object.keys(data.indicies_src[docName]).map(
                                    (markable: string) => [
                                        markable,
                                        data.indicies_src[docName][markable]
                                    ]
                                )
                            )
                        )
                    ]
                )),
                content_mt: new Map<string, Map<string, DocTgt>>(Object.keys(data.content_mt).map(
                    (docKey: string) => [
                        docKey,
                        new Map<string, DocTgt>(Object.keys(data.content_mt[docKey]).map(
                            (tgtKey: string) => [tgtKey, new DocTgt(data.content_mt[docKey][tgtKey])]
                        ))
                    ]
                )),
                rating: new RatingDatabase(data.ratings)
            }
        }

        let data = await $.ajax({
            method: 'POST',
            url: BASEURL + 'login_p2',
            data: JSON.stringify({ 'AID': AID }),
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: (data: any) => {
                return data
            },
            error: (text) => {
                alert('Error syncing with server. Is it up?')
                throw new Error(`${BASEURL} download sync error`)
            }
        })
        return [convertRaw(data), new UserProgress(data.progress.doc, data.progress.mkb, data.progress.sec)]
    }
}