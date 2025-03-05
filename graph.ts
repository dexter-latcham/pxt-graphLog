enum graphOptions{
    BAR,
    PIE,
    LINE
}
namespace graphlog {
    let chosenGraphType: graphOptions = null;
    let setGraphTitle: string = "";
    let headers:string[] = [];
    let lastHeaderCheckedIndex=0;

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
    
    //% block
    //% title.defl="My Chart"
    export function setTitle(title: string) {
        setGraphTitle = title;
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

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let input = serial.readString()
        if(input=="H\n"){
            recheckHeaders();
            if(headers.length != 0){
                serial.writeLine("H:" + headers.join() + ":H");
            }
        }else if(input == "G\n"){
            sendGraphType();
        }else if(input == "T\n"){
            if(setGraphTitle!=""){
                serial.writeLine("T:"+setGraphTitle+":T")
            }
        }
    });

    //% block="draw $type graph"
    export function setGraphType(type: graphOptions) {
        chosenGraphType = type;
        sendGraphType();
    }

}

    // //datalogger doesn't have a "get headers" so this is a hacky workaround
    // //check the first row for headers, if this is wrong then binary search to find the next header insertion line
    // function recheckHeadersBinarySearch(){
    //     let lastRowCouunt = datalogger.getNumberOfRows();
    //     if(lastRowCouunt == 0){
    //         return;
    //     }
    //     let lastRow = datalogger.getRows(lastRowCouunt-1,1);
    //     let lastRowElems = lastRow.split(",");
    //     if(lastRowElems.length == headers.length){
    //         //current headers are correct
    //         return;
    //     }
    //     //at some point between lastChecked and new lengthm, headers have changed
    //     //do a binary search for the first line with the new element
    //     if(lastHeaderCheckedIndex == -1){
    //         let tmpRow = datalogger.getRows(0,1).split(",");
    //         if(tmpRow.length == lastRowElems.length){
    //             headers = tmpRow;
    //             return;
    //         }
    //         lastHeaderCheckedIndex=0;
    //     }
    //     let l = lastHeaderCheckedIndex;
    //     let r = lastRowCouunt -1;
    //     let result = -1;
    //     while(l <= r){
    //         let mid = Math.floor((r + l)/2);
    //         let tmpRow = datalogger.getRows(mid, 1).split(",");
    //         if(tmpRow.length == lastRowElems.length){
    //             result = mid;
    //             r = mid -1;
    //         }else{
    //             l = mid+1;
    //         }
    //     }
    //     headers = datalogger.getRows(result,1).split(",");
    //     lastHeaderCheckedIndex = result;
    //     return;
    // }
