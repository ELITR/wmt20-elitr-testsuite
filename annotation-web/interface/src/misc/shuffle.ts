interface Array<T> {
    shuffle(): T[];
}

Array.prototype.shuffle = function (): any[]{
    let inputArray: any[] = this;
    for (let i: number = inputArray.length - 1; i >= 0; i--){
        var randomIndex: number = Math.floor(Math.random() * (i + 1));
        var itemAtIndex: number = inputArray[randomIndex];

        inputArray[randomIndex] = inputArray[i];
        inputArray[i] = itemAtIndex;
    }
    return inputArray;
}