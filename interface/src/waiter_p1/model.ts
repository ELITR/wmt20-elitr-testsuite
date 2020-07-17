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

    public set(docName: string, mtName: string, sentence: number, rating: RatingObject) {
        let signature = `${docName}-${mtName}`
        this.data[signature] = this.data[signature] || {}
        this.data[signature][sentence.toString()] = rating
    }
    
    public get(docName: string, mtName: string, sentence: number) : RatingObject {
        let signature = `${docName}-${mtName}`
        this.data[signature] = this.data[signature] || {}
        return this.data[signature][sentence.toString()] || {}
    }
}

export class ModelDocumentMT {

    public constructor(private manager: DocumentManager) { }

    public save(AID: string, current: UserProgress) {
        let serializedRatings = this.toObject()

        let docName = this.manager.data.queue_doc[current.doc]
        let mtName = this.manager.data.queue_mt.get(docName)![current.mt]

        this.manager.data.rating.set(docName, mtName, current.sent, serializedRatings)

        $.ajax({
            method: 'POST',
            url: BASEURL + 'save_rating_p1',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'mt': current.mt,
                    'sent': current.sent,
                    'mt_name': mtName,
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


    public nonconflicting?: boolean
    public adequacy?: number
    public fluency?: number
    public errors: string = ''

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