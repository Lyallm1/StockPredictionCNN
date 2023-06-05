const processData = (data, timePortion) => new Promise(resolve => {
    const trainX = [], trainY = [], features = Array.from(data, d => d['close']),
    scaledData = minMaxScaler(features, getMin(features), getMax(features)), scaledFeatures = scaledData.data;
    try {
        for (let i = timePortion; i < data.length; i++) {
            for (let j = i - timePortion; j < i; j++) trainX.push(scaledFeatures[j]);
            trainY.push(scaledFeatures[i]);
        }

    } catch (ex) {
        resolve(ex);
        console.log(ex);
    }
    return resolve({ size: data.length - timePortion, timePortion, trainX, trainY, min: scaledData.min, max: scaledData.max, originalData: features })
}), generateNextDayPrediction = (data, timePortion) => {
    const size = data.length, features = [];
    for (let i = size - timePortion; i < size; i++) features.push(data[i]);
    return features;
}, minMaxScaler = (data, min, max) => ({ data: data.map(value => (value - min) / (max - min)), min, max }),
minMaxInverseScaler = (data, min, max) => ({ data: data.map(value => value * (max - min) + min), min, max }),
getMin = data => Math.min(...data), getMax = data => Math.max(...data), print = text => {
    const el = document.getElementsByClassName('cnn')[0], elem = document.createElement('h5');
    elem.innerHTML = text;
    el.append(elem);
    el.append(document.createElement('br'))
    console.log(text)
}, clearPrint = () => document.getElementsByClassName('cnn')[0].innerHTML = "";

Date.prototype.addDays = days => {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
