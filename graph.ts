enum graphOptions{
    BAR,
    PIE,
    LINE
}

namespace graphlog {
    let graphType: string = "";
    let graphTitle: string = "";
    let headers:string[] = [];
    let connected = false;
    let logLiveDatalogger = false;
    let doSendDataloggerContents = false;
    let headersRequested = false;
    let graphTypeRequested = false;
    let graphTitleRequested = false;
    let okayToSendData = false;
    loops.everyInterval(500, function () {
        if(!connected){
            return;
        }
        if(headersRequested){
            sendGraphHeaders();
            headersRequested=false;
        }
        if(graphTypeRequested){
            sendGraphType();
            graphTypeRequested=false;
        }
        if(graphTitleRequested){
            sendGraphTitle();
            graphTitleRequested=false;
        }
    })

    datalogger.mirrorToSerial(false);
    
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
    export function addData(providedData:datalogger.ColumnValue[] | (()=>void)){
        if(typeof providedData !== "function"){
            serial.writeLine(formatPrintString(providedData));
            return;
        }
        //treat providedData as a function provided to generate data
        providedData();
    }
    
    export function sendDataloggerContents():void{
        if(!connected || !okayToSendData){
            doSendDataloggerContents = true;
            return;
        }
        let dataLoggerSize = datalogger.getNumberOfRows();
        for(let i=0;i<dataLoggerSize;i++){
            let line = datalogger.getRows(i,1);
            serial.writeLine(line);
        }
    }
    
    //%block="get datalogger contents"
    export function getDataloggerContents(): () => void{
        return sendDataloggerContents;
    }


    //% block="draw $type graph"
    export function setGraphType(type: graphOptions) {
        if(type == graphOptions.BAR){
            graphType = "bar"
        }else if(type == graphOptions.PIE){
            graphType = "pie"
        }else if(type == graphOptions.LINE){
            graphType = "line"
        }
        graphTypeRequested=true;
    }
    
    //% block
    //% title.defl="My Chart"
    export function setTitle(title: string) {
        graphTitle = title;
        graphTitleRequested=true;
    }

    //% block="Updata with live logging $on"
    //% blockId=graphUpdateLive
    //% on.shadow=toggleOnOff
    //% on.defl=false
    export function updateLive(on: boolean): void {
        if(logLiveDatalogger == false && connected == true){
            datalogger.mirrorToSerial(on);
        }
        logLiveDatalogger = on;
    }

    function sendGraphType(){
        if(graphType ==""){
            return;
        }
        serial.writeLine("G:"+graphType+":G")
    }

    function sendGraphTitle(){
        if(graphTitle != ""){
            serial.writeLine("T:"+graphTitle+":T");
        }
    }

    function sendGraphHeaders(){
        if(headers.length == 0){
            recheckHeaders();
            if(headers.length == 0){
                return;
            }
        }
        serial.writeLine("H:"+headers.join(",")+":H");
    }

    function startSendingData(){
        if(doSendDataloggerContents){
            sendDataloggerContents();
        }else if(logLiveDatalogger){
            datalogger.mirrorToSerial(true);
        }
    }
    function startConnection(){
        if(connected){
            //need to restart connection
            datalogger.mirrorToSerial(false);
        }
        okayToSendData=false;
        connected = true;
        sendGraphTitle();
        basic.pause(200);
        sendGraphType();
        basic.pause(200);
        recheckHeaders();
        sendGraphHeaders();
    }

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let input = serial.readString()
        if(input == "C\n"){
            startConnection();
        }else if(input == "O\n"){//okay to start sending data
            okayToSendData=true;
            startSendingData();
        }else if(input == "H\n"){
            headersRequested=true;
        }else if(input == "G\n"){
            graphTypeRequested=true;
        }else if(input == "T\n"){
            graphTitleRequested=true;
        }
    });

    //datalogger doesn't have a "get headers" so this is a hacky workaround
    //check the first row for headers, if this is wrong then binary search to find the next header insertion line
    function recheckHeaders() {
        let lastRowIndex = datalogger.getNumberOfRows();
        if (lastRowIndex == 0) {
            return;
        }
        let lastRow = datalogger.getRows(lastRowIndex - 1, 1);
        let lastRowElems = lastRow.split(",");
        let targetElemCount = lastRowElems.length;
        if (targetElemCount == headers.length) {
            //current headers are correct
            return;
        }
        let tmpRow = datalogger.getRows(0, 1).split(",");
        if(tmpRow.length == targetElemCount){
            headers = tmpRow;
            return;
        }
        //go backwards from the end of datalogger because it is likely the headers were changed recently
        for (let i = lastRowIndex - 1; i >= 0; i--) {
            let tmpRow = datalogger.getRows(i, 1).split(",");
            if (tmpRow.length < targetElemCount) {
                tmpRow = datalogger.getRows(i + 1, 1).split(",");
                headers = tmpRow;
                return;
            }
        }
    }
}
