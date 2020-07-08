import { DocumentLoader, UserProgress } from "./document_loader"
import * as $ from 'jquery'
import { DEVMODE } from "../main"

export class Model {
    public documents: Array<[string, Array<ModelDocumentMT>]>
}

export class ModelDocumentMT {
    public name: string

    public constructor(name: string) {
        this.name = name
    }

    public save(AID: string, current: UserProgress, progress: UserProgress) {
        $.ajax({
            method: 'POST',
            url: DocumentLoader.baseURL + 'save_p1',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'mkb': current.mkb,
                    'mtn': current.mtn,
                },
                'progress': {
                    'doc': progress.doc,
                    'mkb': progress.mkb,
                    'mtn': progress.mtn,
                },
                'mt_name': this.name,
                'rating': this.toObject()
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

    public toObject(): any {
        if (!this.resolved()) {
            throw new Error('Attempted to jsonify an unresolved model object')
        }
        return {
            nonconflicting: this.nonconflicting as boolean,
            coherent: this.coherent as number,
            lexical: this.lexical as number,
            errors: this.errors as string
        }
    }
}