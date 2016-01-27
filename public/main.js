/**
 * Created by jaimemac on 1/20/16.
 */
(function() {

    $(document).ready(function(){

        $("#twitter_table_data").hide();

        function request(url, data, methodType, contentType, response, error) {

            $.ajax({
                headers: {
                    "Content-Type": "Content-Type; application/json"
                },
                method: methodType,
                url: url,
                dataType: contentType,
                data: data,
                error: function (error) {
                    console.log("Error : " + error.status + " " + error.statusText)
                }
            })
                .done(response);
        }


        $("#btn_loadCSV").click(function(){

            var data = {csvName : $("#csv_name").val()};

            request("loadfile",data, "GET", null,load_response, load_error);

            function load_response(response) {

                $(".csv-form").hide();
                $("#twitter_table_data").show();
                drawTable(response);

            }

            function load_error(){

            }
        });



        $("#btn_loadTwitter").click(function(){

            request("getTwitter",null, "GET", null, load_response, load_error);

            function load_response(response) {

                $("#twitter_table_data tbody").html("");
                drawTable(response);

            }

            function load_error(){

            }
        });


        function drawTable(data) {
            for (var i = 0; i < data.twitter.length; i++) {
                drawRow(data.twitter[i]);
            }
        }

        function drawRow(rowData) {
            var row = $("<tr />");
            $("#twitter_table_data tbody").append(row);
            row.append($("<td><input type='hidden' value='" + rowData.id + "' name='id' /> " + rowData.id + "</td>"));
            row.append($("<td><img src='" + rowData.profile_image_url + "' border='1' /></td>"));
            row.append($("<td><input type='hidden' value='" + rowData.name + "' name='name' />" + rowData.name  + "</td>"));
            row.append($("<td><a href='http://twitter.com/" + rowData.screen_name + "' target='_blank'>" + rowData.screen_name + "</a></td>"));
            row.append($("<td><input type='hidden' value='" + rowData.followers_count + "' name='followers' />" + rowData.followers_count + "</td>"));
            row.append($("<td><input type='hidden' value='" + rowData.location + "' name='location' />" + rowData.location + "</td>"));
            row.append($("<td><input type='hidden' value='" + rowData.description + "' name='description' />" + rowData.description + "</td>"));
            row.append($("<td><select name='Valid' ><option value='N/A'>Valid</option><option value='valid'>Yes</option> <option value='invalid'>No</option> </select></td>"));
            row.append($("<td><select name='Gender' ><option value='N/A'>Gender</option><option value='male'>Male</option> <option value='female'>Female</option> </select></td>"));
            row.append($("<td><select name='Education' ><option value='N/A'>Education</option><option value='high school'>High School</option> <option value='graduated high school'>Graduated High School</option><option value='in college'>In College</option> <option value='graduated college'>Graduated College</option></select></td>"));
            row.append($("<td><select name='Age' ><option value='N/A'>Age</option><option value='<18'><18</option> <option value='18-24'>18-24</option><option value='25-34'>25-34</option> <option value='35-49'>35-49</option><option value='50+'>50+</option></select></td>"));
            row.append($("<td><select name='Children' ><option value='N/A'>Children</option><option value='has children'>Has Children</option> <option value='no children'>No Children</option> </select></td>"));
            row.append($("<td><select name='Marital Status' ><option value='N/A'>Marital Status</option><option value='in relationship'>In Relationship</option> <option value='single'>Single</option> </select></td>"));
            row.append($("<td><select name='Ethnicity'><option value='N/A'>Ethnicity</option><option value='african american'>African American</option> <option value='asian american'>Asian American</option><option value='caucasian'>Caucasian</option><option value='hispanic'>Hispanic</option> </select></td>"));
            row.append($("<td><select name='Occupation'><option value='N/A'>Occupation</option><option value='unemployed'>Unemployed</option> <option value='minimum wage'>Minimum Wage</option><option value='corporate'>Corporate</option><option value='student'>Student</option> </select></td>"));
        }


        $("#btn_save").click(function(){
            getData();
        });


        function getData()
        {

            var arrayResult = [];

            $('#twitter_table_data tbody tr').each(function () {
                //processing this row
                //how to process each cell(table td) where there is checkbox

                //console.log("Each Row");

                var jsonTemp = {};


                $(this).find('td input').each(function () {

                    //console.log($(this).attr("name") + " : " + $(this).val());

                    var title = $(this).attr("name");
                    var value = ($(this).val() == "" ? "N/A" : $(this).val().replace(/[^\x00-\x7F]/g, "").split("\n").join().split(",").join(""));

                    jsonTemp[title] = value;

                });


                $(this).find('td option:selected').each(function () {

                    //console.log($(this).val());

                    //console.log("title :" + $(this).parent().attr("name") + " : " + $(this).val());

                    var title = $(this).parent().attr("name");
                    var value = $(this).val();

                    jsonTemp[title] = value;

                });

                arrayResult.push(jsonTemp);

            });

            //var data = {csvData : arrayResult};

            request("exportCSV", JSON.stringify(arrayResult), "POST", "json", null, null);

        }



    });

})();