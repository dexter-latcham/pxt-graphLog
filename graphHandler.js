class graph{
    static chart;
    static graphTitle = "";
    static graphType = "";
    static drawnUpToRow = 0;
    static graphHeaders = [];

    static lastDatapointTimestamp=0;
    static timestampOffset =0;


    static updateGraphHeaders(){
        if(!graph.chart){
            return;
        }
        if(graph.graphType == "line"){
            graph.updateLineChartHeaders();
        }else if(graph.graphType == "bar" || graph.graphType == "pie"){
            graph.updateSumChartHeaders();
        }
    }

    static updateSumChartHeaders(){
        let labels = graph.graphHeaders;
        if(graph.graphHeaders[0].startsWith("Time")){
            labels = graph.graphHeaders.slice(1);
        }
        let currentColumnCount = graph.chart.data.labels.length;
        for(let i=currentColumnCount;i<labels.length;i++){
            graph.chart.data.datasets[0].data.push(0);
        }
        graph.chart.data.labels = labels;
    }

    static updateLineChartHeaders(){
        let currentColumnCount = graph.chart.data.datasets.length;
        if(currentColumnCount==0){
            graph.chart.options.scales.x.title.text=graph.graphHeaders[0];
        }

        for(let i=currentColumnCount;i<graph.graphHeaders.length-1;i++){
            graph.chart.data.datasets.push({
                label:graph.graphHeaders[i+1],
                data:[],
                borderColor: `hsl(${i * 60}, 100%, 50%)`,
                fill: false
            })

        }
    }



    static updateTitle(newTitle){
        if(newTitle == graph.graphTitle){
            return;
        }
        graph.graphTitle = newTitle;
        if (graph.chart) {
            graph.chart.options.plugins.title.text = newTitle;
            graph.chart.update();
        }
    }

    static createChart(){
        if(graph.graphHeaders.length ==0 || graph.graphType == ""){
            return;
        }
        if(graph.chart && graph.chart.config.type == graph.graphType){
            return;
        }
        if(graph.chart){
            graph.chart.destroy();
        }
        document.getElementById("dataChart").style.display="block";
        if(graph.graphType == "line"){
            graph.drawLineChart();
        }else if(graph.graphType == "bar" || graph.graphType == "pie"){
            graph.drawSumChart();
        }
        graph.drawnUpToRow=0;
    }

    static updateHeaders(newHeaders){
        graph.graphHeaders = newHeaders;
        if (! graph.chart) {
            graph.createChart();
        }
    }
    static updateType(newType){
        if(newType == graph.graphType){
            return;
        }
        if(newType == "line"){

        }else if(newType == "bar" || newType == "pie"){

        }else{
            return;
        }
        graph.graphType = newType;
        graph.createChart();
    }

    static drawNewChart(dataSets,xLables=[],scales={}){
        let ctx = document.getElementById("dataChart").getContext("2d");
        graph.chart = new Chart(ctx, {
            type: graph.graphType,
            data: {
                labels: xLables,
                datasets: dataSets,
            },
            options: {
                responsive: true,
                scales : scales,
                plugins: {
                    title: {
                        display: true,
                        text: graph.graphTitle,
                        font: {
                            size:20
                        }
                    },
                    legend: {  // Increase legend font size
                        labels: {
                            font: {
                                size: 16 // Adjust the size as needed
                            }
                        }
                    }
                }
            },
        });
    }

    static drawLineChart(){
        let xAxisTitle = "";
        if(graph.graphHeaders.length!=0){
            xAxisTitle = graph.graphHeaders[0];
        }
        let tmpScales = {x: { 
                    type:"linear",
                    title: { 
                        display: true,
                        text: xAxisTitle,
                        font: { size: 18 }
                    },
        }};
        let tmpDatasets=[];
        if(graph.graphHeaders.length!=0){
            tmpDatasets = graph.graphHeaders.slice(1).map((header,index) => ({
                label:header,
                data:[],
                borderColor: `hsl(${index * 60}, 100%, 50%)`,
                fill: false
            }));
        }
        graph.lastDatapointTimestamp =0;
        graph.timestampOffset=0;
        graph.drawNewChart(tmpDatasets,[],tmpScales);
    }

    static drawSumChart(){
        let labels = graph.graphHeaders;

        if(graph.graphHeaders.length !=0){
            if(graph.graphHeaders[0].startsWith("Time")){
                labels = labels.slice(1);
            }
        }
        let dataToPlot = [{
                label: "",
                data: new Array(labels.length).fill(0),
                backgroundColor: ["red", "blue", "green", "yellow", "purple", "orange"]
            }];

        graph.drawNewChart(dataToPlot,labels,{})
    }

    static updateLineChart(newData){
        for(let row of newData){
            if(graph.graphHeaders[0].startsWith("Time")){
                if(row[0] < graph.lastDatapointTimestamp){
                    graph.addDividorToLineChart(graph.lastDatapointTimestamp);
                    graph.timestampOffset = graph.lastDatapointTimestamp-row[0]
                }
                graph.lastDatapointTimestamp = row[0];
                row[0] = row[0]+graph.timestampOffset
            }
            let maxI = Math.min(row.length,graph.graphHeaders.length);
            for(let i=1;i<maxI;i++){
                graph.chart.data.datasets[i-1].data.push({y:row[i],x:""+row[0]});
            }
        }
        graph.chart.update();
    }

    static updateSumChart(newData){
        let rowOffset =0;
        if(graph.graphHeaders[0].startsWith("Time")){
            rowOffset = 1;
        }
        for(let row of newData){
            let maxI = Math.min(row.length,graph.graphHeaders.length);
            for(let i=rowOffset;i<maxI;i++){
                let elem = row[i];
                if(!isNaN(elem)){
                    graph.chart.data.datasets[0].data[i-rowOffset]+=elem;
                }
            }
        }
    }

    static addDividorToLineChart(xPosition){
        if (!graph.chart.options.plugins.annotation) {
            graph.chart.options.plugins.annotation = { annotations: [] };
        }

        // Add a new vertical line annotation with a hover tooltip
        graph.chart.options.plugins.annotation={annotations:[{
            type: 'line',
            scaleID: 'x',
            mode: 'vertical',
            value: xPosition,
            borderColor: 'red',
            borderWidth: 2,
            borderDash: [6, 6], // Dashed line (optional)
            label: {
                display: false,
                content: `time values restart from 0`,
                backgroundColor: "rgba(0,0,0,0.8)", // Dark background
                color: "white",
                font: {
                    size: 14
                },
                padding: 6
            },
            enter({ element }, event) {
                element.label.options.display = true;
                return true; // force update
            },
            leave({ element }, event) {
                element.label.options.display = false;
                return true;
            }
                
        }]};
    }
    static getDrawnTo(){
        return graph.drawnUpToRow;
    }
    static updateChart(providedData){
        if(!graph.chart){
            return;
        }

        if(graph.graphType == "line"){
            graph.updateLineChart(providedData);
        }else if(graph.graphType == "pie" || graph.graphType == "bar"){
            graph.updateSumChart(providedData);
        }
        graph.drawnUpToRow = graph.drawnUpToRow+providedData.length;
        graph.chart.update(); 
    }
}


