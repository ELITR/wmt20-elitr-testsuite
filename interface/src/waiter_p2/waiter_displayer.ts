import '../misc/object_utils'
import { ModelMT } from './model'

export class WaiterDisplayer {

    public static generateElements(snippets: Array<[string, string]>, rating: { [mt: string]: any }): string {
        let output = snippets.map(([mtName, value], index: number) => {
            let mtRating = rating[mtName] || {}
            let errorContent = ModelMT.ERROR_TYPES.map(([type, name, hint], _) => `
                <div class='waiter_p2_error_line'>
                    <div>
                        <input trigger ${mtRating[type] == undefined ? '' : (mtRating[type] ? 'checked' : '')} type='checkbox' id='${type}_${index}_checkbox' index='${index}' class='syncdisabled'>
                        <label title='${hint}' for='${type}_${index}_checkbox'>${name}</label>
                    </div>
                    <div>
                        <input id='val_${index}_${type}' index='${index}' ${mtRating[type] == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.25' value='${mtRating[type] ?? -1}'>
                        <label id='val_${index}_${type}_text' for='${type}_${index}'>-</label>
                    </div>
                </div>
            `).reduce((prev: string, current: string) => prev + current)


            return `
            <div class='div_snip tgt_snip_p2' mtname='${mtName}'>${value}</div>

            <div class='waiter_p2_response'>
                <div class='waiter_p2_error_header'>
                    <label>Error type:</label>
                    <label>Severity:</label>
                </div>

                <div class='waiter_p2_error_type'>
                    ${errorContent}
                </div>
                </div>
            </div>

            <br>
        `
        }).reduce((prev: string, current: string) => prev + current)

        return output
    }
}