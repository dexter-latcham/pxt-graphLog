enum graphOptions{
    BAR,
    PIE,
    LINE
}

namespace graphlog {
    let chosenGraphType: graphOptions = null;
    let setGraphTitle: string = "";
    let headers:string[] = ["foo","bar"];
    let lastHeaderCheckedIndex=0;
    let dataLoggerIterator = 0;
    let connected = false;
    let logLiveDatalogger = false;

    datalogger.mirrorToSerial(false)


    //% block="draw $type graph"
    export function setGraphType(type: graphOptions) {
        chosenGraphType = type;
        sendGraphType();
    }
    
    //% block
    //% title.defl="My Chart"
    export function setTitle(title: string) {
        setGraphTitle = title;
    }
    
    export function formatPrintString(data: datalogger.ColumnValue[]):string{
        for(let elem of data){
            if(headers.indexOf(elem.column)===-1){
                headers.push(elem.column);
            }
        }
        // Create an object to store column values
        let dataMap: { [key: string]: string } = {};
        
        // Populate the object with data values
        for (let i = 0; i < data.length; i++) {
            dataMap[data[i].column] = data[i].value;
        }
        
        // Build the CSV string based on providedHeaders
        let result: string[] = [];
        for (let i = 0; i < headers.length; i++) {
            result.push(dataMap[headers[i]] || "");
        }
        return result.join(",");
    }

    //% block="add data to chart $providedData"
    //% blockId=graphAddData
    //% providedData.shadow=lists_create_with
    //% providedData.defl=dataloggercreatecolumnvalue
    export function addData(providedData:datalogger.ColumnValue[] | (()=>string)){
        if(typeof providedData !== "function"){
            serial.writeLine(formatPrintString(providedData));
            return;
        }
        //tread providedData as a generator
        let foo = providedData();
        while(foo != null){
            serial.writeLine(foo);
            foo = providedData();
        }

    }
    
    export function getDataloggerContentsFunction():string{
        if(dataLoggerIterator == datalogger.getNumberOfRows()){
            return null;
        }
        dataLoggerIterator+=1;
        return datalogger.getRows(dataLoggerIterator-1,1);
    }
    
    //%block="get datalogger contents"
    export function getDataloggerContents(): () => string{
        return getDataloggerContentsFunction;
    }


    //% block="Updata with live logging $on"
    //% blockId=graphUpdateLive
    //% on.shadow=toggleOnOff
    //% on.defl=false
    export function updateLive(on: boolean): void {
        flashlog.setSerialMirroring(on);
    }

    function sendGraphType(){
        let type = "";
        if(chosenGraphType == graphOptions.BAR){
            type = "bar";
        }else if(chosenGraphType == graphOptions.PIE){
            type = "pie";
        }else if(chosenGraphType == graphOptions.LINE){
            type = "line";
        }
        if(type != ""){
            serial.writeLine("G:"+type+":G")
        }
    }

    function startConnection(){

    }
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let input = serial.readString()
        if(input == "C\n"){
            connected = true;
            startConnection();
        }
    });

    //datalogger doesn't have a "get headers" so this is a hacky workaround
    //check the first row for headers, if this is wrong then binary search to find the next header insertion line
    function recheckHeaders(){
        let lastRowCount = datalogger.getNumberOfRows();
        if(lastRowCount == 0){
            return;
        }
        let lastRow = datalogger.getRows(lastRowCount-1,1);
        let lastRowElems = lastRow.split(",");
        let targetElemCount = lastRowElems.length;
        if(targetElemCount== headers.length){
            //current headers are correct
            return;
        }
        for(let i=lastHeaderCheckedIndex;i<lastRowCount;i++){
            let tmpRow = datalogger.getRows(i,1).split(",");
            if(tmpRow.length == targetElemCount){
                // should probably check if tmpRow = current headers 
                // with some extra entries, if there is no overlap 
                // then this is likely a malformed string
                headers = tmpRow;
                lastHeaderCheckedIndex = i;
                return;
            }
        }
    }
}

