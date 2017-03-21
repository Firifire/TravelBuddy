var express = require('express'); //express handles routes
var http = require('http'); //need http module to create a server
var app = express(); //starting express
var bodyParser = require('body-parser');
var request = require('request');
var apiai = require('apiai');
var suspend = require('suspend');


app.set('port', process.env.PORT || 3000); //set port to cloud9 specific port or 3000
app.use(bodyParser.json()); //body parser used to parse request data

var amaKey = "BAUWiuhWv3qwTueQj5KchRx0p0Ja9YyE";
var aiapp = apiai("dd7628304abe46128fa8eb3799fa8b85"); 
var FBurl = "https://graph.facebook.com/v2.6/me/messages?access_token=EAAK16wMW9YkBABSH9nAyZCDJTiR9qiBgDx0605dMjCQysUsLZBX2rBEB4STqZBBX1ZASyCNCKDkkZAhxbLUXpmJ1Pf0GmlTfWkaZCgsXuKvaEQQTZABZBZBCyeh9cqnokE7cm8wtybKsk5rdj5zF44kCm04hUXA9QilZBZBnfKtRJFGqwZDZD"; //replace with your page token


var ansWait = 0;
var sender;

//Facebook Verification
app.get('/', verificationHandler);
function verificationHandler(req, res) {
    console.log(req);
    if (req.query['hub.verify_token'] === 'FBM') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token!');
}
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
app.get('/test', seatswap);
function seatswap(req, res) {
    travelBuddy();
}
//Facebook Message Handling
app.post('/', handleMessage);
function handleMessage(req, res) {
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            APIai(sender, text);
        }
    }
    res.end('received!');
}

//Facebook Reply
function replyMsg(id, text) {
    var options = {
        uri: FBurl,
        method: 'POST',
        json: {
            "recipient": {
                "id": id
            },
            "message": {
                "text": text
            }
        }
    }
    request(options, function (error, response, body) {
        if (error) {
            console.log(error.message);
        }
    });
};

//Facebook Reply
function imageMsg(id, url) {
    var options = {
        uri: FBurl,
        method: 'POST',
        json: {
            "recipient": {
                "id": id
            },
            "message": {
                "attachment": {
                    "type": "image",
                    "payload": {
                        "url": url
                    }
                }
            }

        }
    }
    request(options, function (error, response, body) {
        if (error) {
            console.log(error.message);
        }
    });
};

//Process the sentence
function APIai(sender, text) {
    var request = aiapp.textRequest(text, {
        sessionId: '123345051256'
    });

    request.on('response', function (response) {
        if (ansWait == 1) {
            if (response.result.action == 'yes') {
                replyMsg(sender, "Congratulations, your seat has been swaped next to " + temp2.name);//[+]add interests
                replyMsg(sender, "Here is the link to his facebook account: https://www.facebook.com/" + temp2.id);
                replyMsg(sender, "Hope you enjoy your flight with AirAsia :D")
            }
            else
                replyMsg(sender, "Alright. Hope you enjoy your trip :) ");
            ansWait = 0;
        }
        else if (response.result.action == 'poi')
            ACity(response.result.parameters.arrival_cities);
        else if (response.result.action == 'buddy')
            travelBuddy();
        replyMsg(sender, response.result.fulfillment.speech);
        //console.log(response.result.fulfillment.speech);
        
    });

    request.on('error', function (error) {
        console.log(error);
    });


    request.end();
}

//Amadeus
//point of interest
function ACity(city_name) {

    // Configure the request
    console.log(city_name);
    var options = {
        url: 'https://api.sandbox.amadeus.com/v1.2/points-of-interest/yapq-search-text?apikey=' + amaKey + '&city_name=' + city_name + '&number_of_results=' + 3,

    }

    var a;
    request(options, function (error, response, body) {
        
        temp = JSON.parse(response.body);
        if (temp.points_of_interest != undefined) {
            if (temp.points_of_interest[0] != undefined) {
                console.log(temp);
                a = temp.points_of_interest[0].main_image;
                b = temp.points_of_interest[0].title;
                c = temp.points_of_interest[1].main_image;
                d = temp.points_of_interest[1].title;
                e = temp.points_of_interest[2].main_image;
                f = temp.points_of_interest[2].title;

                suspend(function* () {
                    imageMsg(sender, a);
                    replyMsg(sender, b);
                    yield setTimeout(suspend.resume(), 3000); // 10 seconds pass..
                    imageMsg(sender, c);
                    replyMsg(sender, d);
                    yield setTimeout(suspend.resume(), 3000);
                    imageMsg(sender, e);
                    replyMsg(sender, f);
                })();
            }
            else {
                replyMsg(sender, "Sorry we do not support this city yet")
            }
        }
        else {
            replyMsg(sender, "Sorry we do not support this city yet")
        }
        

        
        
    });
}


//airasia
//executes after purchase is done
function travelBuddy() {
    
    var options = {
        url: 'https://graph.facebook.com/v2.8/me?fields=name%2Clikes.limit(4)&access_token=EAACEdEose0cBAI9BCVHPiAK9cVJ3AYYfZAAUMT8ShflcZCpMC9TjmEt8l5OMWOPBWkPHL5MRAhrFxmxvpgnfn7KfPZALY3skMDkZA5J5dSbHrx2aZBjxtQvuSqdZCthb7BEo3HvsUm85xNauYZBFCxTri7siUfNDqK5qJ0p0A6pQqZANPi22dhqJKBl3IideVggZD'  //[+]
    }
    var options2 = {
        url: 'https://graph.facebook.com/v2.8/me?fields=name%2Clikes.limit(4)&access_token=EAACEdEose0cBAI9BCVHPiAK9cVJ3AYYfZAAUMT8ShflcZCpMC9TjmEt8l5OMWOPBWkPHL5MRAhrFxmxvpgnfn7KfPZALY3skMDkZA5J5dSbHrx2aZBjxtQvuSqdZCthb7BEo3HvsUm85xNauYZBFCxTri7siUfNDqK5qJ0p0A6pQqZANPi22dhqJKBl3IideVggZD'  //[+]
    }
    var session = 0;

    suspend(function* () {
        yield setTimeout(suspend.resume(), 5000);
        request(options, function (error, response, body) {
            temp = JSON.parse(response.body);

            request(options2, function (error, response, body) {
                temp2 = JSON.parse(response.body);
                // console.log(temp.likes);
                if (temp.likes != undefined && temp2.likes != undefined) {
                    for (var x = 0; x < temp.likes.data.length; x++)
                        for (var y = 0; y < temp2.likes.data.length; y++) {
                            if (temp.likes.data[x].id == temp2.likes.data[y].id)
                                session = session + 2;
                            else if (temp.likes.data[x].id == temp2.likes.data[y].id)
                                session++;
                        }
                    console.log("session: " + session);
                    if (session > 4) {
                        ansWait = 1;
                        replyMsg(sender, "We have found someone you might be interested to know, would you like to swap seat next to the user?");

                    }
                }
                else {
                    replyMsg(sender, "Need to update token")
                }
            });

        });
    })();
    
    
}