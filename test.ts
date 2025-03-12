datalogger.deleteLog(datalogger.DeleteType.Full)
function testLineSimple(){
    graphlog.setGraphType(graphOptions.LINE);
    datalogger.includeTimestamp(FlashLogTimeStampFormat.Milliseconds)
    let currentVal = Math.random() * 20
    let trend = (Math.random() - 0.5) * 0.5
    let trendPeriod = 20
    for(let i=0;i<10;i++){
        if (i % trendPeriod == 0) {
            trend = (Math.random() - 0.5) * 0.5
        }
        let noise = (Math.random() - 0.5) * 2
        currentVal += trend + noise
        currentVal = Math.max(0, Math.min(20, currentVal))
        datalogger.log(datalogger.createCV("x", currentVal));
    }
    graphlog.addData(graphlog.getDataloggerContents());
}

function testLineSplit(){
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

        let timestamp = control.millis();
        let sinVal = Math.sin(timestamp/100) * 3;
        datalogger.log(datalogger.createCV("Time(ms)", timestamp),
            datalogger.createCV("random trend", currentVal));
            // datalogger.createCV("y", sinVal));
        basic.pause(20);
    }
    let offset = control.millis();
    for(let i=50;i<100;i++){
        if (i % trendPeriod == 0) {
            trend = (Math.random() - 0.5) * 0.5
        }
        let noise = (Math.random() - 0.5) * 2
        currentVal += trend + noise
        currentVal = Math.max(0, Math.min(20, currentVal))
        let timestamp = control.millis()-offset
        let sinVal = Math.sin(timestamp/100) * 3;
        datalogger.log(datalogger.createCV("Time(ms)", timestamp),
            datalogger.createCV("random trend", currentVal),
            datalogger.createCV("sin wave", sinVal));
        basic.pause(20);
    }
    graphlog.addData(graphlog.getDataloggerContents());
}

function testAccelerometer(){
    graphlog.setGraphType(graphOptions.LINE);
    datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
    graphlog.setTitle("Graph of acceleration (x,y,z)");
    basic.showLeds(`
        . . # . .
        . . # . .
        . . # . .
        . . # . .
        . . # . .
        `)
    for(let i=0;i<100;i++){
        datalogger.log(
            datalogger.createCV("Time(ms)", control.millis()),
            datalogger.createCV("x", input.acceleration(Dimension.X)),
            datalogger.createCV("y", input.acceleration(Dimension.Y)),
            datalogger.createCV("z", input.acceleration(Dimension.Z))
        )
        basic.pause(20);
    }

    let offset = control.millis();
    for(let i=0;i<100;i++){
        datalogger.log(
            datalogger.createCV("Time(ms)", control.millis()-offset),
            datalogger.createCV("x", input.acceleration(Dimension.X)),
            datalogger.createCV("y", input.acceleration(Dimension.Y)),
            datalogger.createCV("z", input.acceleration(Dimension.Z))
        )
        basic.pause(20);
    }
    basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
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
testAccelerometer();
