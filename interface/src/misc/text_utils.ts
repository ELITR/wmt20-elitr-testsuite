export class TextUtils {
    public static contextSentence(raw: string, position: number, minCharContext: number = 150, sentenceCount: number = 1): [number, number] {
        let output = raw

        // left context align to nearest full-stop
        let offsetA = 0
        let sentenceCountA = sentenceCount
        for (; position - minCharContext - offsetA >= 0; offsetA++) {
            if (output.substr(position - minCharContext - offsetA, 2).match(/\. /)) {
                sentenceCountA -= 1
            }
            if (sentenceCountA == 0) {
                break
            }
        }
        if (sentenceCountA == 0)
            offsetA -= 2

        // right context align to nearest full-stop
        let offsetB = 0
        let sentenceCountB = sentenceCount
        for (; position + minCharContext + offsetB < output.length; offsetB++) {
            if (output.substr(position + minCharContext + offsetB, 2).match(/\. /)) {
                sentenceCountB -= 1
            }
            if (sentenceCountB == 0) {
                break
            }
        }
        if (sentenceCountB == 0)
            offsetB += 1

        return [position - minCharContext - offsetA, position + minCharContext + offsetB]
    }

    public static contextWord(raw: string, position: number, minCharContext: number = 150, wordCount: number = 1): [number, number] {
        let offsetA = 0
        let wordCountA = wordCount
        for (; position - minCharContext - offsetA >= 0; offsetA++) {
            if (raw.substr(position - minCharContext - offsetA, 1).match(/\W/)) {
                wordCountA -= 1
            }
            if (wordCountA == 0) {
                break
            }
        }
        if (wordCountA == 0) {
            offsetA -= 1
        }

        let offsetB = 0
        let wordCountB = wordCount
        for (; position + minCharContext + offsetB < raw.length; offsetB++) {
            if (raw.substr(position + minCharContext + offsetB, 1).match(/\W/)) {
                wordCountB -= 1
            }
            if (wordCountB == 0) {
                break
            }
        }
        if (wordCountB == 0) {
            // offsetB -= 1
        }

        return [position - offsetA - minCharContext, position + offsetB + minCharContext]
    }
}