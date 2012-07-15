/* Authur: Robert Chrzanowski */

/*jslint
  node: true, devel: true, indent: 2,
  regexp: true */

(function () {
  "use strict";

  var http, url, server, buffer,
    hdr, reg, result, dewebify;

  buffer = require("buffer");
  http = require("http");
  url = require("url");

  server = http.createServer();

  // converts web strings
  dewebify = function (data) {
    var i, string = "";

    for (i = 0; i < data.length; i += 1) {
      if (data[i] === "+") {
        string += " ";
      } else if (data[i] === "%") {
        string +=
          String.fromCharCode(parseInt(data.substring(i + 1, i + 3), 16));
        i += 2;
      } else {
        string += data[i];
      }
    }

    return string;
  };

  server = http.createServer();

  server.on("request", function (request, response) {
    hdr = url.parse(request.url);

    console.dir(hdr);

    response.setHeader("Access-Control-Allow-Origin", "*");

    switch (request.method) {
    case "GET":
      if (hdr.pathname === "/") {
        response.write("OK");
      } else {
        // regex for city, state
        reg = /^\/([a-z]*)-([a-z]*)-Homes-For-Sale\/?$/i;
        result = reg.exec(hdr.pathname);

        if (result) {
          response.write(JSON.stringify({city: result[1], state: result[2]}));
          console.log(JSON.stringify({city: result[1], state: result[2]}));
        } else {
          response.statusCode = 404;
          console.log("404");
        }
      }

      response.end();

      break;

    case "POST":
      if (hdr.pathname === "/reverse") {
        request.setEncoding("utf8");

        request.on("data", function reverse(data) {
          var i, reg, string, rString;

          console.log(data);

          string = dewebify(data);

          // regex theString field
          reg = /(^|&)theString=([^&]*)(&|$)/i;
          result = reg.exec(string);

          if (result) {
            // reverse string
            string = result[2];
            rString = "";

            for (i = string.length - 1; i >= 0; i -= 1) {
              rString += string.charAt(i);
            }

            response.write(rString);
            console.log(rString);
          } else {
            response.statusCode = 404;
            console.log("404");
          }

          response.end();
        });
      } else if (hdr.pathname === "/sort") {
        request.setEncoding("utf8");

        request.on("data", function sort(data) {
          var
            i, reg, result,
            string, retString,
            array, strArray;

          string = dewebify(data);

          // get theArray field
          reg = /(^|&)theArray=([^\s]*)(&|$)/i;
          result = reg.exec(string);

          if (result) {
            array = JSON.parse(result[2]);

            if (array) {
              strArray = [];

              // get array of strings only
              for (i = 0; i < array.length; i += 1) {
                if (typeof array[i] === "string") {
                  strArray.push(array[i]);
                }
              }

              // sort strArray and stringify
              retString = JSON.stringify(strArray.sort());
            }
          } else {
            retString = "";
          }

          response.write(retString);
          console.log(retString);
          response.end();
        });
      } else {
        response.statusCode = 404;
        console.log("404");
        response.end();
      }

      break;

    default:
      response.statusCode = 404;
      console.log("404");
      response.end();
      break;
    }
  });

  server.listen(8080);
}());
