$(document).ready(function () {
    var _series1
        , _series2
        , _series3
        , totalPoints = 50
        , $delay = 1000
        , $temperatureDisplay = $('div.sensor-values div.temperature')
        , $lightDisplay = $('div.sensor-values div.light')
        , $moistureDisplay = $('div.sensor-values div.moisture')
        ;

    var socket = io.connect('http://192.168.1.249:3000')
    socket.on('chart:data', function (readings) {
        if (!_series1 || !_series2 || !_series3) { return; }
        _series1.addPoint([readings.date, readings.value[0]], false, true);
        _series2.addPoint([readings.date, readings.value[1]], false, true);
        _series3.addPoint([readings.date, readings.value[2]], true, true);

        updateSensorDisplayValues(readings.value);
        console.log(readings.value);
    })

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateTemperature(value) {
        $temperatureDisplay.html(value);
    }

    function updateLight(value) {
        $lightDisplay.html(value + '<span>%</span>');
    }

    function updateMoisture(value) {
        $moistureDisplay.html(value + '<span>%</span>');
    }

    function updateSensorDisplayValues(d) {
        updateTemperature(d[0]);
        updateLight(d[1]);
        updateMoisture(d[2]);
    }

    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        },
        tooltip: {
            enabled: false
        }
    });

    $('#sensorData').highcharts({
        chart: {
            type: 'spline',
            events: {
                load: function() {
                    // set each series for updating with web socket event
                    _series1 = this.series[0];
                    _series2 = this.series[1];
                    _series3 = this.series[2];
                }
            }
        },
        title: {
            text: 'Sensor Data'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500
        },
        yAxis: [{
            title: {
                text: 'TEMPERATURE',
                style: {
                    color: '#2b908f',
                    font: '13px sans-serif'
                }
            },
            min: 50,
            max: 120,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        }, {
            title: {
                text: 'LIGHT',
                style: {
                    color: '#90ee7e',
                    font: '13px sans-serif'
                }
            },
            min: 0,
            max: 100,
            opposite: true,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        }, {
            title: {
                text: 'MOISTURE',
                style: {
                    color: '#f45b5b',
                    font: '13px sans-serif'
                }
            },
            // omitting min and max to auto scale moisture axis yAxis
            //min: 0,
            //max: 100,
            opposite: true,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        }],
        tooltip: {
            formatter: function() {
                var unitOfMeasurement = this.series.name === 'TEMPERATURE' ? '  °F' : ' %';
                return '<b>' + this.series.name + '</b><br/>' +
                    Highcharts.numberFormat(this.y, 1) + unitOfMeasurement;
            }
        },
        legend: {
            enabled: true
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'TEMPERATURE',
            yAxis: 0,
            style: {
                color: '#2b908f'
            },
            data: (function() {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -totalPoints; i <= 0; i += 1) {
                    data.push({
                        x: time + i * $delay,
                        y: getRandomInt(80, 80)
                    });
                }
                return data;
            }())
        }, {
            name: 'LIGHT',
            yAxis: 1,
            data: (function() {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -totalPoints; i <= 0; i += 1) {
                    data.push({
                        x: time + i * $delay,
                        y: getRandomInt(.7, .7)
                    });
                }
                return data;
            }())
        }, {
            name: 'Moisture',
            yAxis: 2,
            data: (function() {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -totalPoints; i <= 0; i += 1) {
                    data.push({
                        x: time + i * $delay,
                        y: getRandomInt(0, 0)
                    });
                }
                return data;
            }())
        }]
    });
});