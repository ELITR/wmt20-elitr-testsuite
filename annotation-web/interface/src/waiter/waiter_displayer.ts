import '../misc/shuffle'

export class WaiterDisplayer {

    public static generateElements(snippets: Array<[string, string]>): string {
        let output = snippets.map(([key, value], index: number) => {
            return `
            <div class='div_snip tgt_snip'>${value}</div>

            <div class='waiter_response'>
                <div>
                <div>Was it translated?</div>
                <div class='waiter_response_single'>
                    <input id='val_${index}_trans' index='${index}' class='synctext' type='checkbox' value='-1'>
                    <div id='val_${index}_trans_text'>-</div>
                </div>
                </div>
                <div>
                <div>Acceptable translation?</div>
                <div class='waiter_response_single'>
                    <input id='val_${index}_accpt' index='${index}' class='synctext' type='range' min='0' , max='1' , step='0.1' value='-1'>
                    <div id='val_${index}_accpt_text'>-</div>
                </div>
                </div>
                <div>
                <div>Non-conflicting?</div>
                <div class='waiter_response_single'>
                    <input id='val_${index}_nonconf' index='${index}' class='synctext' type='range' min='0' , max='1' , step='0.1' value='-1'>
                    <div id='val_${index}_nonconf_text'>-</div>
                </div>
                </div>
                <br>
            </div>

            <br>
        `
        }).shuffle().reduce((prev: string, current: string) => prev + current)

        return output
    }
}