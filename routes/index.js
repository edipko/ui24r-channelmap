var express = require('express');
var router = express.Router();
var fs = require('fs');
var json = {};
const http = require('http')

//var filename = '/Users/edipko/Downloads/2021.07.15-backup.json';


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/query', function(req, res, next) {

    const options = {
        hostname: '10.10.2.10',
        port: 80,
        path: '/js/initparams.js',
        method: 'GET'
    }

    callback = function(response) {
        var str = '';

        //another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function () {

            let obj = str.match(/.*dataValue={(.*)}.*/)
            let jsonString = "{" + obj[1].replace(/,$/, "") + "}";
            let json = JSON.parse(jsonString)

            var inputs = {};
            for (var key in json) {
                if (key.match(/^i.[0-9][0-9]?.(name)$/)) {
                    names = key.split('.');
                    baseName = names[0] + "." + names[1];
                    if (!json[key].match(/^.*FAT$/)) {
                        inputs[key] = json[key];
                    }
                }
            }

            var hw_inputs = {};
            for (var key in inputs) {
                names = key.split('.');
                baseName = names[0] + "." + names[1];
                if (json[key].length > 0) {
                    number = parseInt(json[baseName + ".src"].split('.')[1]) + 1
                    hw_inputs[number] = json[key];
                }
            }

            // Make sure all channels exist for display purposes
            var count = 1;
            while (count <= 20) {
                if (count in hw_inputs) {
                    count++;
                } else {
                    hw_inputs[count] = " ";
                    count++;
                }

            }

            var aux = {};
            for (var key in json) {
                if (key.match(/^a.[0-9][0-9]?.(name)$/)) {
                    names = key.split('.');
                    if (json[key].length > 0) {
                        aux[parseInt(names[1]) + 1] = json[key]
                    }
                }
            }

            // Make sure all AUX exist for display purposes
            // We do this because the JSON has 9 and 10 - which do not exist on the mixer physically
            var count = 1;
            while (count <= 8) {
                if (count in aux) {
                    count++;
                } else {
                    aux[count] = " ";
                    count++;
                }

            }

            output = {};
            output["inputs"] = hw_inputs;
            output["aux"] = aux;
            output["title"] = "Ui24R Channel Map";

            res.render('display', output);

        });

    }
    http.request(options, callback).end();



});


router.post('/display', function(req, res, next) {
    var filename = req.body.name;
    //var filename = filenames.files[0].name;

    fs.readFile(filename, 'utf8', function (err, data) {
        //if (err) throw err;
        json = JSON.parse(data);

        var inputs = {};
        for (var key in json) {
            if (key.match(/^i.[0-9][0-9]?.(name)$/)) {
                names = key.split('.');
                baseName = names[0] + "." + names[1];
                if (!json[key].match(/^.*FAT$/)) {
                    inputs[key] = json[key];
                }
            }
        }

        var hw_inputs = {};
        for (var key in inputs) {
            names = key.split('.');
            baseName = names[0] + "." + names[1];
            if (json[key].length > 0) {
                number = parseInt(json[baseName + ".src"].split('.')[1]) + 1
                hw_inputs[number] = json[key];
            }
        }

        // Make sure all channels exist for display purposes
        var count = 1;
        while (count <= 20) {
            if (count in hw_inputs) {
                count++;
            } else {
                hw_inputs[count] = " ";
                count++;
            }

        }

        var aux = {};
        for (var key in json) {
            if (key.match(/^a.[0-9][0-9]?.(name)$/)) {
                names = key.split('.');
                if (json[key].length > 0) {
                    aux[parseInt(names[1]) + 1] = json[key]
                }
            }
        }

        // Make sure all AUX exist for display purposes
        // We do this because the JSON has 9 and 10 - which do not exist on the mixer physically
        var count = 1;
        while (count <= 8) {
            if (count in aux) {
                count++;
            } else {
                aux[count] = " ";
                count++;
            }

        }

        output = {};
        output["inputs"] = hw_inputs;
        output["aux"] = aux;
        output["title"] = "Ui24R Channel Map";

        res.render('display', output);

    });
});


router.get('/inputlist', function(req, res, next) {
    output["title"] = "Ui24R Input List"
    res.render('inputlist', output);
});

router.get('/outputlist', function(req, res, next) {
    output["title"] = "Ui24R Output(AUX) List"
    res.render('outputlist', output);
});

router.get('/printlist', function(req, res, next) {
    output["title"] = "Ui24R Print List"
    res.render('printlist', output);
});

module.exports = router;
