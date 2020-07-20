import '../misc/object_utils'

export class WaiterDisplayer {

    public static generateElements(snippets: Array<[string, string]>, rating: { [mt: string]: any }): string {
        let output = snippets.map(([key, value], index: number) => {
            let mtRating = rating[key] || {}
            return `
            <div class='div_snip tgt_snip_p2'>${value}</div>

            <div class='waiter_p2_response'>
                <div class='waiter_p2_response_single'>
                    <div>Fluency:</div>
                    <input id='val_${index}_fluency' index='${index}' ${mtRating.fluency == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${mtRating.fluency ?? -1}'>
                    <div id='val_${index}_fluency_text'>-</div>
                </div>
                
                <div class='waiter_p2_response_single'>
                    <div>Adequacy:</div>
                    <input id='val_${index}_adequacy' index='${index}' ${mtRating.adequacy == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${mtRating.adequacy ?? -1}'>
                    <div id='val_${index}_adequacy_text'>-</div>
                </div>

                <div>
                <div>Error type:</div>
                <div class='waiter_p2_error_type'>
                    <input type='checkbox' id='nontranslated_${index}'>
                    <label for='nontranslated_${index}'>Not translated</label>
                    <input type='checkbox' id='tootranslated_${index}'>
                    <label for='tootranslated_${index}'>Over-translated</label>
                    <br>

                    <input type='checkbox' id='terminology_${index}'>
                    <label for='terminology_${index}'>Bad terminology</label>
                    <input type='checkbox' id='style_${index}'>
                    <label for='style_${index}'>Bad style</label>
                    <br>

                    <input type='checkbox' id='sense_${index}'>
                    <label for='sense_${index}'>Distorted sense</label>
                    <input type='checkbox' id='typography_${index}'>
                    <label for='typography_${index}'>Bad typography</label>

                    <br>
                    <input type='checkbox' id='grammar_${index}'>
                    <label for='grammar_${index}'>Grammar</label>
                </div>
                </div>
            </div>

            <br>
        `
        }).shuffle().reduce((prev: string, current: string) => prev + current)

        return output
    }
}