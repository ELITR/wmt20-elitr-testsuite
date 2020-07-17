import * as $ from 'jquery'
import { BASEURL } from '../main'
import { DocSrc, DocTgt } from '../misc/document'
import { RatingDatabase } from './model'

export interface UserIntroSync {
    queue_doc: Readonly<Array<string>>,
    queue_mt: Readonly<Map<string, Array<string>>>,
    names_mt: Readonly<Array<string>>,
    content_src: Readonly<Map<string, DocSrc>>,
    content_mt: Readonly<Map<string, Map<string, DocTgt>>>,
    rating: RatingDatabase,
}

export class UserProgress {
    constructor(
        public doc: number,
        public mt: number,
        public sent: number,
    ) { }

    public beginning(): boolean {
        return this.doc == 0 && this.mt == 0 && this.sent == 0
    }

    public finished(): boolean {
        return this.doc == -1 && this.mt == -1 && this.sent == -1
    }

    public clone(): UserProgress {
        return new UserProgress(this.doc, this.mt, this.sent)
    }
}

export class DocumentLoader {
    public static async load(AID: string): Promise<[UserIntroSync, UserProgress]> {
        let convertRaw = (data: any): UserIntroSync => {
            return {
                queue_doc: data.queue_doc,
                queue_mt: new Map<string, Array<string>>(Object.keys(data.queue_mt).map(
                    (key: string) => [key, data.queue_mt[key]]
                )),
                names_mt: data.names_mt,
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
                rating: new RatingDatabase(data.ratings)
            }
        }

        let data = await $.ajax({
            method: 'POST',
            url: BASEURL + 'login_p1',
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
        return [convertRaw(data), new UserProgress(data.progress.doc, data.progress.mt, data.progress.sent)]
    }
}