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
    
    public get(docName: string, mkbName: string, sentence: number) : RatingDic {
        let signature = `${docName}-${mkbName}`
        this.data[signature] = this.data[signature] || {}
        return this.data[signature][sentence.toString()] || {}
    }
}

export class Model {
    public documents: Array<[string, Array<ModelMarkable>]>
}

export class ModelMarkable {
    public segments: Array<ModelSegement>
}

export class ModelSegement {
    public mtModels: Array<ModelMT>
    
    public constructor(private manager: DocumentManager) {
        this.mtModels = this.manager.data.names_mt.map((mtName: string) => new ModelMT(mtName))
     }

    public save(AID: string, current: UserProgress) {
        let serializedRatings: { [key: string]: any } = {}
        this.mtModels.forEach((model: ModelMT) => serializedRatings[model.name] = model.toObject())
        
        let docName = this.manager.data.queue_doc[current.doc]
        let mkbName = this.manager.data.queue_mkb.get(docName)[current.mkb]

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
    public translated?: boolean
    public adequacy?: number
    public fluency?: number
    public errors: string

    public name: string

    public constructor(name: string) {
        this.name = name
    }

    public resolved(): boolean {
        if (DEVMODE)
            return true
        else
            return (this.translated != undefined && this.adequacy != undefined && this.fluency != undefined)
    }

    public toObject(): RatingObject {
        if (false && !this.resolved()) {
            throw new Error('Attempted to serialize an unresolved model object')
        }
        return { translated: this.translated as boolean, adequacy: this.adequacy as number, fluency: this.fluency as number, errors: this.errors as string }
    }
}