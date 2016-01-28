/**
 * Created by jaimemac on 1/20/16.
 */

var express             = require('express');
var app                 = express();
var path                = require("path");
// jsonexport
var jsonexport          = require('jsonexport');
// filesystem
var fs                  = require('fs');
// json to csv covertor
var converter           = require('json-2-csv');
// logging
var winston             = require('winston');
var csv                 = require("fast-csv");
var Twitter             = require('twitter');
var serveIndex          = require('serve-index');



var sFileName                   = "";
var iCheckTwitterData;
var csvFile;
var arrayUsers                  = [];
var arrayImages                 = [];
var arrayUsersData              = [];
var arrayUserTwitterData        = [];
var iPageNo                     = 1;
var iTotalPages;


var objTwitterData              = null;


app.use('/downloads', serveIndex(__dirname + '/downloads'));
app.use('/csv', serveIndex(__dirname + '/csv'));


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
    //__dirname : It will resolve to your project folder.
});

app.get('/about',function(req,res){
    res.sendFile(path.join(__dirname+'/client.html'));
});


app.get('/getTwitter', function (req, res) {


    if (iPageNo <= iTotalPages)
    {

        getTwitterHandles();


        var iCheckTwitterData = setInterval(checkTwitterData,1000);


        function checkTwitterData()
        {
            if (objTwitterData != null)
            {
                res.send(objTwitterData);
                objTwitterData  = null;
                clearInterval(iCheckTwitterData);
            }
        }

    }



});

app.get('/loadfile', function (req, res) {

    sFileName = req.query.csvName;

    LoadCSV(sFileName);

    var iCheckTwitterDataLoad = setInterval(checkTwitterData,1000);

    function checkTwitterData()
    {
        if (objTwitterData != null)
        {
            res.send(objTwitterData);
            objTwitterData = null;
            clearInterval(iCheckTwitterDataLoad);
        }
    }



});


var a = null;

app.post('/exportCSV', function (req, res) {


    /*
    var icheck = setInterval(test, 500);

    function test()
    {
        if (a != null)
        {
            res.setHeader('Content-disposition', 'attachment; filename=testing.csv');
            res.set('Content-Type', 'text/csv; charset=utf-8');
            res.status(200).send(a);

            console.log("jaime");

            clearInterval(icheck);
        }
    }

    */



    /*
    req.on('data', function (data) {

        var name = JSON.parse(data);

        function json2csvCallback(err, csv) {
            if (err) throw err;

            //a = csv;

            // Save CSV File

            var sCSVFilename = sFileName + (iPageNo-1);

            console.log("Filename : " + sCSVFilename);

            fs.writeFile('downloads/' + sCSVFilename + '.csv', csv, function(err) {
                if (err) throw err;
                console.log('file saved');
                res.send("OK 200");
            });

        };

        converter.json2csv(name, json2csvCallback);

    });
    */

   var body;

    req.on('data', function(chunk) {
        body = chunk;

    });

    req.on('end', function() {


        var name = JSON.parse(body);

        function json2csvCallback(err, csv) {
            if (err) throw err;

            // Save CSV File

            var sCSVFilename = sFileName + (iPageNo-1);

            console.log("Filename : " + sCSVFilename);

            fs.writeFile('downloads/' + sCSVFilename + '.csv', csv, function(err) {
                if (err) throw err;
                console.log('file saved');
                res.send("OK 200");
            });

        };

        converter.json2csv(name, json2csvCallback);


    });



});





app.use('/public', express.static(__dirname + '/public'));
app.use('/downloads', express.static(__dirname + '/downloads'));

app.listen(process.env.PORT || 5000);

console.log("Running at Port 5000");



var client = new Twitter({
    consumer_key: 'wrYF9hApsNGs8OgU3MyQw',
    consumer_secret: 'a5i8UlzzgIJ2HHqZPg8yfQHMZGaPVj38iW9OyG3oQ',
    access_token_key: '19669840-I4m2CWkH9jExlhCRqJMOKtdVppe9EW1ig7z7p7KZM',
    access_token_secret: 'FaXH9kjQ16wGpmstnR5f8evN2Ov3RWfqF1bCa7Zit9IgL'
});





function LoadCSV(sCSVFileName)
{

    csv
        .fromPath("csv/" + sCSVFileName + ".csv")
        .on("data", function(data){

            arrayUsers.push(data[0]);

        })
        .on("end", function(){

            //saveLog("csv file loaded","none");

            iTotalPages =  Math.ceil(arrayUsers.length/100);

            getTwitterHandles();
     });
}


function getTwitterHandles()
{

    var params  = {'screen_name': arrayUsers.showRangeAsString(2 + ((iPageNo-1)*100), 101 + ((iPageNo-1)*100))};
    var path    = "users/lookup";

    client.get(path, params, twitterResponse);

    iPageNo += 1;

}



function twitterResponse(error, response)
{
    if (!error) {

        var jsonTemp    = {twitter : response, currentPage : iPageNo, totalpages : iTotalPages};
        objTwitterData  = jsonTemp;

    }
    else {
        //saveLog("Error : " + error[0].message + " Code : " + error[0].code, "Error : " + error[0].message + " Code : " + error[0].code)

    }
}




Array.prototype.showRangeAsString = function(iStartAmt, iFinishAmt){

    var mystring = "";

    for (var i=(iStartAmt-1); i<iFinishAmt; i++){

        mystring += this[i] + ((i+1) == iFinishAmt ? "" : ",");
    }

    return mystring;
}





////////////////////////////////////////////////
//
// Compares two arrays shows the differences
//
////////////////////////////////////////////////

function validateTwitterUsers(a, b) {

    var seen = [], diff = [];
    for ( var i = 0; i < b.length; i++)
        seen[b[i]] = true;
    for ( var i = 0; i < a.length; i++)
        if (!seen[a[i]])
            diff.push(a[i]);
    return diff;
}



function saveLog(sLog, sErrorMessage)
{
    winston.add(winston.transports.File, { filename: 'log/somefile.log' });
    winston.log('info', sLog);
    winston.error(sErrorMessage);
}


