basic.showIcon(IconNames.Heart)
graphlog.setTitle("My Chart")

datalogger.deleteLog()
datalogger.mirrorToSerial(true)

function linePlotTest(){
    graphlog.setGraphType(graphOptions.LINE)
    datalogger.includeTimestamp(FlashLogTimeStampFormat.Milliseconds)
    let noise = 0;
    let currentVal = Math.random() * 20
    let trend = (Math.random() - 0.5) * 0.5
    let trendPeriod = 20
    let i=0;
    while(true){
        if (i % trendPeriod == 0) {
            trend = (Math.random() - 0.5) * 0.5
        }
        noise = (Math.random() - 0.5) * 2
        currentVal += trend + noise
        currentVal = Math.max(0, Math.min(20, currentVal))
        let timeStamp = (control.millis() / 1000000);
        let sinVal = Math.sin(i) * 3;
        datalogger.log(
            datalogger.createCV("value", currentVal),
            datalogger.createCV("sin", sinVal)
        )
        basic.pause(200);
        i+=1;
    }
}

function barPlotTest(){
    graphlog.setGraphType(graphOptions.PIE);
    datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
    let i=0;
    while(true){
        datalogger.log(
            datalogger.createCV("value", i)
        )
        basic.pause(200);
        i+=1;
    }
}
linePlotTest();
