datalogger.deleteLog(datalogger.DeleteType.Full)
function testLine(){
    graphlog.setGraphType(graphOptions.LINE);
    datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
    let currentVal = Math.random() * 20
    let trend = (Math.random() - 0.5) * 0.5
    let trendPeriod = 20
    for(let i=0;i<50;i++){
        if (i % trendPeriod == 0) {
            trend = (Math.random() - 0.5) * 0.5
        }
        let noise = (Math.random() - 0.5) * 2
        currentVal += trend + noise
        currentVal = Math.max(0, Math.min(20, currentVal))
        let sinVal = Math.sin(i) * 3;
        datalogger.log(datalogger.createCV("Time(ms)", control.millis()),
            datalogger.createCV("x", currentVal),
            datalogger.createCV("y", sinVal));
    }
    let offset = control.millis();
    for(let i=50;i<100;i++){
        if (i % trendPeriod == 0) {
            trend = (Math.random() - 0.5) * 0.5
        }
        let noise = (Math.random() - 0.5) * 2
        currentVal += trend + noise
        currentVal = Math.max(0, Math.min(20, currentVal))
        let sinVal = Math.sin(i) * 3;
        datalogger.log(datalogger.createCV("Time(ms)", control.millis()-offset),
            datalogger.createCV("x", currentVal),
            datalogger.createCV("y", sinVal));
    }
    graphlog.addData(graphlog.getDataloggerContents());
}
function testBar(){
    graphlog.setGraphType(graphOptions.BAR);
    let owl = randint(2,3);
    let dove = randint(5,6);
    for(let i=0;i<5;i++){
        datalogger.log(datalogger.createCV("owl",owl),
            datalogger.createCV("dove", dove))
    }
    graphlog.addData(graphlog.getDataloggerContents());
}
testLine();
