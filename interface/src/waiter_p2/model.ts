import { UserProgress } from "./document_loader"
import * as $ from 'jquery'
import { DEVMODE, BASEURL } from "../main"
import { DocumentManager } from "./document_manager"

export type RatingObject = any
export type RatingDic = { [mt: string]: RatingObject }

export class RatingDatabase {
    private data: { [signature: string]: { [section: string]: RatingDic } }

    public constructor(data: { [signature: string]: { [section: string]: RatingObject } }) {
        this.data = data
    }

    public set(docName: string, mkbName: string, sentence: number, rating: RatingDic) {
        let signature = `${docName}-${mkbName}`
        this.data[signature] = this.data[signature] || {}
        this.data[signature][sentence.toString()] = rating
    }

    public get(docName: string, mkbName: string, sentence: number): RatingDic {
        let signature = `${docName}-${mkbName}`
        this.data[signature] = this.data[signature] || {}
        return this.data[signature][sentence.toString()] || {}
    }
}

export class ModelSegement {
    public mtModels: Array<ModelMT>

    public constructor(private manager: DocumentManager, current: UserProgress) {
        let docName = this.manager.data.queue_doc[current.doc]
        this.mtModels = this.manager.data.queue_mt.get(docName)!.map((mtName: string) => new ModelMT(mtName))
    }

    public save(AID: string, current: UserProgress) {
        let serializedRatings: { [key: string]: any } = {}
        this.mtModels.forEach((model: ModelMT) => serializedRatings[model.name] = model.toObject())

        let docName = this.manager.data.queue_doc[current.doc]
        let mkbName = this.manager.data.queue_mkb.get(docName)![current.mkb]

        this.manager.data.rating.set(docName, mkbName, current.sec, serializedRatings)

        $.ajax({
            method: 'POST',
            url: BASEURL + 'save_rating_p2',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'mkb': current.mkb,
                    'sec': current.sec,
                    'doc_name': docName,
                    'mkb_name': mkbName,
                },
                'rating': serializedRatings,
            }),
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
        }).done((data: any) => {
            console.log(data)
        })
    }
}

export class ModelMT {
    public static ERROR_TYPES: Array<[string, string, string]> = [
        ['nontranslated', 'Not translated', 'The markable ofrpart of it was not translated.'],
        ['tootranslated', 'Over-translated', "The markable was translated, but should not be."],
        ['terminology', 'Terminology', 'Misleading terminology is used.'],
        ['style', 'Style', 'Inappropriate style is used.'],
        ['sense', 'Sense', 'The meaning is different than intended.'],
        ['typography', 'Typography', 'Including wrong capitalization.'],
        ['role', 'Semantic role', 'The roles of objects/actors were altered.'],
        ['grammar', 'Other grammar', 'Grammar errors other than wrong semantic roles'],
        ['inconsistency', 'Inconsistency', 'Different word choice than in the previous occurences.'],
        ['conflict', 'Conflict', 'Is in conflict with other markable.'],
        ['disappearance', 'Disappearance', 'The source markable is not present in the translation.']
    ]
    public data: { [key: string]: number | undefined } = {}

    public name: string
    public constructor(name: string) {
        this.name = name
    }

    public resolved(): boolean {
        return true
    }

    public toObject(): RatingObject {
        // if (!this.resolved()) {
        //     throw new Error('Attempted to serialize an unresolved model object')
        // }
        return this.data
    }
}