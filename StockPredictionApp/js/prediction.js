const buildCnn = data => new Promise(resolve => {
    const model = tf.sequential();
    model.add(tf.layers.inputLayer({ inputShape: [7, 1] }));
    model.add(tf.layers.conv1d({ kernelSize: 2, filters: 128, strides: 1, use_bias: true, activation: 'relu', kernelInitializer: 'VarianceScaling' }));
    model.add(tf.layers.averagePooling1d({ poolSize: [2], strides: [1] }));
    model.add(tf.layers.conv1d({ kernelSize: 2, filters: 64, strides: 1, use_bias: true, activation: 'relu', kernelInitializer: 'VarianceScaling' }));
    model.add(tf.layers.averagePooling1d({ poolSize: [2], strides: [1] }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 1, kernelInitializer: 'VarianceScaling', activation: 'linear' }));
    return resolve({ model, data });
}), cnn = (model, data, epochs) => {
    console.log("MODEL SUMMARY: ")
    model.summary();
    return new Promise((resolve, reject) => {
        try {
            model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
            model.fit(data.tensorTrainX, data.tensorTrainY, { epochs }).then(result => {
                print("Loss after last Epoch (" + result.epoch.length + ") is: " + result.history.loss[result.epoch.length - 1]);
                resolve(model);
            })
        } catch (ex) {
            reject(ex);
        }
    });
}

$(document).ready(() => {
    plotData([], []);
    $('#getCompany').click(() => {
        clearPrint();
        print("Beginning Stock Prediction ...");
        const company = $('#company').val().trim();
        $.getJSON(`https://api.iextrading.com/1.0/stock/${company}/chart/1y`.toLowerCase()).then(data => {
            const labels = data.map(val => val['date']);
            processData(data, 7).then(result => buildCnn(result).then(built => {
                const tensorData = {
                    tensorTrainX: tf.tensor1d(built.data.trainX).reshape([built.data.size, built.data.timePortion, 1]),
                    tensorTrainY: tf.tensor1d(built.data.trainY)
                }, { max, min } = built.data;
                cnn(built.model, tensorData, 100).then(model => model.predict(tf.tensor1d(minMaxScaler(generateNextDayPrediction(result.originalData, result.timePortion), min, max).data).reshape([1, built.data.timePortion, 1])).data().then(predValue => {
                    const inversePredictedValue = minMaxInverseScaler(predValue, min, max);
                    model.predict(tensorData.tensorTrainX).data().then(pred => {
                        const predictedXInverse = minMaxInverseScaler(pred, min, max);
                        predictedXInverse.data = Array.prototype.slice.call(predictedXInverse.data);
                        predictedXInverse.data[predictedXInverse.data.length] = inversePredictedValue.data[0];
                        plotData(minMaxInverseScaler(built.data.trainY, min, max).data, predictedXInverse.data, labels);
                    });
                    print("Predicted Stock Price of " + company + " for date " + moment(new Date(`${labels[labels.length - 1]}T00:00:00.000`).addDays(1)).format("DD-MM-YYYY") + " is: " + inversePredictedValue.data[0].toFixed(3) + "$");
                }));
            }));
        });
    });
});
