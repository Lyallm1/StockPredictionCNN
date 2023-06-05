const plotData = (data1, data2, label = null) => window.myLine = new Chart(document.getElementById('canvas').getContext('2d'), {
    type: 'line', data: {
        labels: label ? label : [...Array(Math.max(data1.length, data2.length)).keys()], datasets: [
            { label: 'Predicted', fill: false, backgroundColor: 'red', borderColor: 'red', data: data2 },
            { label: 'Actual', backgroundColor: 'blue', borderColor: 'blue', data: data1, fill: false }
        ]
    }, options: {
        responsive: true, title: { display: true, text: 'Stock Price Prediction' },
        tooltips: { mode: 'index', intersect: false }, hover: { mode: 'nearest', intersect: true }, scales: {
            xAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Date' } }],
            yAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Stock Value' } }]
        }
    }
});
