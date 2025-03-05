let headers: string[] = []
let type = "bar";

let pauseLoop = false;

basic.showIcon(IconNames.Heart)


serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    pauseLoop = true;
    let input = serial.readString()
    if (input == "getCols\n") {
        serial.writeLine("H:" + headers.join() + ":H")
    } else if (input == "getType\n") {
        serial.writeLine("T:" + type + ":T")
    }
    pauseLoop = false;
})

input.onButtonPressed(Button.A, function () {
    type = "bar";
    serial.writeLine("T:" + type + ":T")
    basic.showLeds(`
        . . . . .
        # . . . .
        # # . # .
        # # # # #
        # # # # #
        `)
})

input.onButtonPressed(Button.B, function () {
    type = "pie";
    serial.writeLine("T:" + type + ":T")
    basic.showLeds(`
        . . # . .
        . # # # .
        # # # # #
        . # # # .
        . . # . .
        `)
})

headers.push("owl")
headers.push("dove")
for (let index = 0; index < 400; index++) {
    let owl = "" + randint(0, 3)
    let dove = "" + randint(0, 3)
    if (!pauseLoop) {
        serial.writeLine(`D:${owl},${dove}:D`);
    }
    basic.pause(200);
}
headers.push("pigeon")
while (true) {
    let owl = "" + randint(0, 2)
    let dove = "" + randint(0, 7)
    let pigeon = "" + randint(0, 4)
    if (!pauseLoop) {
        serial.writeLine(`D:${owl},${dove},${pigeon}:D`);
    }
    basic.pause(200);
}
