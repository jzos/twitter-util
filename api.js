/**
 * Created by jaimemac on 1/20/16.
 */


/****
 *
  * Todo : Rewrite the code using sails.js in MVC
 */


var express             = require('express');
var app                 = express();
var path                = require("path");
var jsonexport          = require('jsonexport');
var fs                  = require('fs');
var converter           = require('json-2-csv');
var csv                 = require("fast-csv");
var Twitter             = require('twitter');
var serveIndex          = require('serve-index');
var walk                = require('walk');


var sFileName                   = "";
var iCheckTwitterData;
var csvFile;
var arrayUsers                  = [];
var arrayImages                 = [];
var arrayUsersData              = [];
var arrayUserTwitterData        = [];
var iPageNo;
var iTotalPages;
var objTwitterData              = null;




function getCSVFiles(callback)
{
    var arrayFiles                   = [];

    var walker  = walk.walk('./csv', { followLinks: false });

    walker.on('file', function(root, stat, next) {

        var jsonTemp = {};

        if (stat.name.indexOf(".") != 0) {

            jsonTemp["file_name"] = stat.name.replace(".csv","");
            arrayFiles.push(jsonTemp);
        }

        next();
    });

    walker.on('end', function() {
        callback(arrayFiles);
    });

}








/***
 *
 * Twitter API credentials
 */

var client = new Twitter({
    consumer_key: 'wrYF9hApsNGs8OgU3MyQw',
    consumer_secret: 'a5i8UlzzgIJ2HHqZPg8yfQHMZGaPVj38iW9OyG3oQ',
    access_token_key: '19669840-I4m2CWkH9jExlhCRqJMOKtdVppe9EW1ig7z7p7KZM',
    access_token_secret: 'FaXH9kjQ16wGpmstnR5f8evN2Ov3RWfqF1bCa7Zit9IgL'
});



app.use('/downloads', serveIndex(__dirname + '/downloads'));
app.use('/csv', serveIndex(__dirname + '/csv'));



app.get('/',function(req,res){
    res.sendFile(path.join(__dirname +'/index.html'));
    //__dirname : It will resolve to your project folder.
});


app.get('/pageCSV', function (req, res) {

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



app.get('/getCSVNames', function (req, res) {

    getCSVFiles(callback);

    function callback(files)
    {
        res.send(files);
    }

});




app.get('/loadCSV', function (req, res) {

    sFileName = req.query.csvName;

    LoadCSV(sFileName);

    iPageNo = 1;

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



app.post('/exportCSV', function (req, res) {

    var body = '';

    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        var csv = JSON.parse(body);


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

        converter.json2csv(csv, json2csvCallback);

    });

});





app.use('/public', express.static(__dirname + '/public'));
app.use('/downloads', express.static(__dirname + '/downloads'));

app.listen(process.env.PORT || 5000);

console.log("Running at Port 5000");


/*****
 *
 * This loads the CSV file from the csv directory
 * @param sCSVFileName
 *
 */


function LoadCSV(sCSVFileName)
{


    arrayUsers = [];

    csv
        .fromPath("csv/" + sCSVFileName + ".csv")
        .on("data", function(data){

            arrayUsers.push(data[0]);

        })
        .on("end", function(){

            iTotalPages =  Math.ceil(arrayUsers.length/100);

            getTwitterHandles();
     });
}

/*****
 * Queries the Twitter API
 *
 */

function getTwitterHandles()
{

    /****
     * Twitter API : https://dev.twitter.com/rest/reference/get/users/lookup
     */

    var params  = {'user_id': arrayUsers.showRangeAsString(1 + ((iPageNo-1)*100), 100 + ((iPageNo-1)*100))};
    var path    = "users/lookup";

    client.get(path, params, twitterResponse);

}


/***
 *
 * Handles the Twitter response
 * @param error
 * @param response
 */

function twitterResponse(error, response)
{
    if (!error) {

        var jsonTemp    = {twitter : response, currentPage : iPageNo, totalpages : iTotalPages};
        objTwitterData  = jsonTemp;

        iPageNo += 1;

    }
    else {
        // Log errors

    }
}


/***
 *
 * Extends the Array object to specify a range to return
 *
 * @param iStartAmt
 * @param iFinishAmt
 * @returns {string}
 */

Array.prototype.showRangeAsString = function(iStartAmt, iFinishAmt){

    var mystring = "";

    for (var i=(iStartAmt-1); i<iFinishAmt; i++){

        mystring += this[i] + ((i+1) == iFinishAmt ? "" : ",");
    }

    return mystring;
}
