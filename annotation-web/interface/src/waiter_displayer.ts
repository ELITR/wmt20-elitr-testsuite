export class WaiterDisplayer {

    public static generateElements(snippets: Array<[string, string]>): string {
        let output = snippets.map(([key, value], index: number) => {
            return `
            <div class='div_snip tgt_snip'>${value}</div>

            <div class='waiter_responses'>
                <div>
                <div>Was it translated?</div>
                <div class='waiter_response_single'>
                    <input id='val_${index}_trans' class='synctext' type='checkbox' checked='false'>
                    <div id='val_${index}_trans_text'>Yes</div>
                </div>
                </div>
                <div>
                <div>Acceptable translation?</div>
                <div class='waiter_response_single'>
                    <input id='val_${index}_accpt' class='synctext' type='range' min='0' , max='1' , step='0.1' value='0.5'>
                    <div id='val_${index}_accpt_text'>0.7</div>
                </div>
                </div>
                <div>
                <div>Non-conflicting?</div>
                <div class='waiter_response_single'>
                    <input id='val_${index}_nonconf' class='synctext' type='range' min='0' , max='1' , step='0.1' value='0.5'>
                    <div id='val_${index}_nonconf_text'>0.3</div>
                </div>
                </div>
                <br>
            </div>

            <br>
        `
        }).reduce((prev: string, current: string) => prev + current)

        return output
    }
}