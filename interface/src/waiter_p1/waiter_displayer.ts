import '../misc/shuffle'

export class WaiterDisplayer {

    public static generateElements(snippets: Array<[string, string]>): string {
        let output = snippets.map(([key, value], index: number) => {
            return `
            <div class='div_snip tgt_snip'>${value}</div>

            <div class='waiter_p1_response'>
                <div>
                <div>Was translated:</div>
                <div class='waiter_p1_response_single'>
                    <input id='val_${index}_trans' index='${index}' class='synctext' type='checkbox' value='-1'>
                    <div id='val_${index}_trans_text'>-</div>
                </div>
                </div>

                <div>
                <div>Fluency:</div>
                <div class='waiter_p1_response_single'>
                    <input id='val_${index}_fluency' index='${index}' class='synctext' type='range' min='0' , max='1' , step='0.1' value='-1'>
                    <div id='val_${index}_fluency_text'>-</div>
                </div>
                </div>
                
                <div>
                <div>Adequacy:</div>
                <div class='waiter_p1_response_single'>
                    <input id='val_${index}_adequacy' index='${index}' class='synctext' type='range' min='0' , max='1' , step='0.1' value='-1'>
                    <div id='val_${index}_adequacy_text'>-</div>
                </div>
                </div>

                <div>
                <div>Mistakes:</div>
                <div class='waiter_p1_response_single'>
                    <textarea id='val_${index}_errors' index='${index}' class='synctext'></textarea>
                </div>
                </div>

                <!--
                <div>
                    <div>Non-conflicting?</div>
                    <div class='waiter_p1_response_single'>
                        <input id='val_${index}_nonconf' index='${index}' class='synctext' type='range' min='0' , max='1' , step='0.1' value='-1'>
                        <div id='val_${index}_nonconf_text'>-</div>
                    </div>
                    </div>
                    -->
                <br>
            </div>

            <br>
        `
        }).shuffle().reduce((prev: string, current: string) => prev + current)

        return output
    }
}