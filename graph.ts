enum graphType {
    NONE =0,
    BAR = 1,
    PIE = 2
}

namespace displayGraph {
    export class inputData {
        public value: number;
        public colour: number;
        constructor(
            public name: string,
            value: number,
            colour: number
        ) {
            this.value = value;
            this.colour = colour;
        }
    }

    //
    //% blockId=graphcolorindexpicker block="$index" blockHidden=true
    //% index.fieldEditor="colornumber"
    //% index.fieldOptions.valueMode="index"
    //% index.fieldOptions.colours='["#000000","#ffffff","#ff2121","#ff93c4","#ff8135","#fff609","#249ca3","#78dc52","#003fad","#87f2ff","#8e2ec4","#a4839f","#5c406c","#e5cdc4","#91463d","#000000"]'
    //% index.fieldOptions.decompileLiterals="true"
    export function __colorIndexPicker(index: number) {
        return index;
    }


    //% block="name $name value $value colour $c=graphcolorindexpicker"
    //% value.shadow=math_number
    //% blockId=graphCreateInput
    //% c.defl=8
    //% weight=80
    export function createIV(name: string, value: number, c: number): inputData {
        return new inputData(name, value, c);
    }

    //% block="plot bar chart for array $providedData"
    //% blockId=graphBarChartArray
    //% providedData.shadow=lists_create_with
    //% providedData.defl=graphCreateInput
    //% weight=100
    export function barChart(providedData: inputData[]) {
    }

    //% block="plot pie chart for array $providedData"
    //% blockId=graphPieChartArray
    //% providedData.shadow=lists_create_with
    //% providedData.defl=graphCreateInput
    //% weight=100
    export function pieChart(providedData: inputData[]) {
    }
    
    //% block="set title $providedTitle"
    export function setTitle(providedTitle:string):void{
    }
    
    //%block="draw key $keyChoice"
    //keyChoice.shadow=toggleOnOff
    //keyChoice.defl=false
    export function drawKey(keyChoice:boolean):void{
    }

    //function that retrieved heading from a datalogger file
    //and then sums each column to find  a total
    //these totals can then be plotted on a graph
    //can handle columns being added within the log
    //introduces a requirment on datalgger, this probably isnt the place for it
    //%block="sum datalogger contents"
    export function sumDataLogger():inputData[]{
        let headers = datalogger.getRows(0, 1);
        let titles = headers.split(",");
        let colCount = titles.length;

        let sums: displayGraph.inputData[] = [];
        for (let i = 1; i < titles.length; i++) {
            sums.push(new displayGraph.inputData(titles[i], 0, i+1));
        }
        for (let i = 1; i < datalogger.getNumberOfRows(); i++) {
            let row = datalogger.getRows(i, 1);
            let values = row.split(",");
            if(values.length != colCount){
                for (let j = colCount; j < values.length; j++) {
                    sums.push(new displayGraph.inputData(values[j], 0, j+1));
                }
                colCount = values.length;
            }else{
                for (let j = 0; j < values.length-1; j++) {
                    if(values[j+1]!=""){
                        sums[j].value +=parseFloat(values[j+1]);
                    }
                }
            }
        }
        return sums;
    }
}
