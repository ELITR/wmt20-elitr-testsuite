interface Array<T> {
    shuffle(): T[]
}

Array.prototype.shuffle = function (): any[] {
    let inputArray: any[] = this;
    for (let i: number = inputArray.length - 1; i >= 0; i--) {
        var randomIndex: number = Math.floor(Math.random() * (i + 1));
        var itemAtIndex: number = inputArray[randomIndex];

        inputArray[randomIndex] = inputArray[i];
        inputArray[i] = itemAtIndex;
    }
    return inputArray;
}

interface String {
    nthIndexOf(pattern: string, n: number): number
    linesCount(): number
}

String.prototype.nthIndexOf = function (pattern: string, n: number): number {
    let i = -1;

    while (n-- && i++ < this.length) {
        i = this.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}

String.prototype.linesCount = function(): number {
    return (this.match(/\n/g) || []).length
}