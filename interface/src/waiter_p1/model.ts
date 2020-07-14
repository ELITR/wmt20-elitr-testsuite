import { UserProgress } from "./document_loader"
import * as $ from 'jquery'
import { DEVMODE } from "../main"
import { DocumentManager } from "./document_manager"
import { PageUtils } from "../misc/page_utils"

export class Model {
    public documents: Array<[string, Array<ModelDocumentMT>]>
}

export class ModelDocumentMT {

    public constructor(private manager: DocumentManager) { }

    public save(AID: string, current: UserProgress) {
        let serializedRatings = this.toObject()

        let docName = this.manager.data.queue_doc[current.doc]
        let mtName = this.manager.data.queue_mt[docName][current.mt]

        this.manager.data.rating[this.signature(docName, mtName)] = serializedRatings

        $.ajax({
            method: 'POST',
            url: PageUtils.baseURL + 'save_rating_p1',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'mt':  current.mt,
                    'mt_name':  mtName,
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
    public coherent?: number
    public lexical?: number
    public errors?: string

    public resolved(): boolean {
        if (DEVMODE)
            return true
        else
            return (this.nonconflicting != undefined && this.coherent != undefined)
    }

    public signature(docName: string, mtName: string): string {
        return `${docName}-${mtName}`
    }

    public toObject(): any {
        if (false && !this.resolved()) {
            throw new Error('Attempted to serialize an unresolved model object')
        }
        return {
            nonconflicting: this.nonconflicting as boolean,
            coherent: this.coherent as number,
            lexical: this.lexical as number,
            errors: this.errors as string
        }
    }
}