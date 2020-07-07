export class TextUtils {
    public static context(raw: string, position: number, context: number = 150, sentence_count: number = 1) {
        let output = raw

        // left context align to nearest full-stop
        let offset_a = 0
        let sentence_count_a = sentence_count
        for (; position - context - offset_a >= 0; offset_a++) {
            if (output.substr(position - context - offset_a, 2).match(/\. /)) {
                sentence_count_a -= 1
            }
            if (sentence_count_a == 0) {
                break
            }
        }
        if (sentence_count_a == 0)
            offset_a -= 2

        // right context align to nearest full-stop
        let offset_b = 0
        let sentence_count_b = sentence_count
        for (; offset_b + context + offset_b <= output.length; offset_b++) {
            if (output.substr(position + context + offset_b, 2).match(/\. /)) {
                sentence_count_b -= 1
            }
            if (sentence_count_b == 0) {
                break
            }
        }
        if (sentence_count_b == 0)
            offset_b += 1

        output = output.substring(position - context - offset_a, position + context + offset_b)

        return output
    }
}