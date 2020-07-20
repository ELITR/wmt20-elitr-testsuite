import { UserProgress } from "./document_loader"
import * as $ from 'jquery'
import { DEVMODE, BASEURL } from "../main"
import { DocumentManager } from "./document_manager"

export type RatingObject = any

export class RatingDatabase {
    private data: { [signature: string]: { [sentence: string]: RatingObject } }

    public constructor(data: { [signature: string]: { [sentence: string]: RatingObject } }) {
        this.data = data
    }

    public set(docName: string, sentence: number, rating: RatingObject) {
        this.data[docName] = this.data[docName] || {}
        this.data[docName][sentence.toString()] = rating
    }

    public get(docName: string, sentence: number): RatingObject {
        this.data[docName] = this.data[docName] || {}
        return this.data[docName][sentence.toString()] || {}
    }
}

export class ModelDocument {
    public mtModels: Array<ModelMT>

    public constructor(private manager: DocumentManager, current: UserProgress) {
        let docName = this.manager.data.queue_doc[current.doc]
        this.mtModels = this.manager.data.queue_mt.get(docName)!.map((mtName: string) => new ModelMT(mtName))
    }


    public save(AID: string, current: UserProgress) {
        let serializedRatings: { [key: string]: any } = {}
        this.mtModels.forEach((model: ModelMT) => serializedRatings[model.name] = model.toObject())

        let docName = this.manager.data.queue_doc[current.doc]

        this.manager.data.rating.set(docName, current.sent, serializedRatings)

        $.ajax({
            method: 'POST',
            url: BASEURL + 'save_rating_p1',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'sent': current.sent,
                    'doc_name': docName,
                },
                'rating': serializedRatings
            }),
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
        }).done((data: any) => {
            console.log(data)
        })
    }
}


export class ModelMT {
    public nonconflicting?: boolean
    public adequacy?: number
    public fluency?: number
    public errors: string = ''

    public name: string

    public constructor(name: string) {
        this.name = name
    }

    public resolved(): boolean {
        if (DEVMODE)
            return true
        else
            return (this.nonconflicting != undefined && this.adequacy != undefined && this.fluency != undefined)
    }

    public toObject(): RatingObject {
        // if (!this.resolved()) {
        //     throw new Error('Attempted to serialize an unresolved model object')
        // }
        return {
            nonconflicting: this.nonconflicting as boolean,
            fluency: this.fluency as number,
            adequacy: this.adequacy as number,
            errors: this.errors as string
        }
    }
}