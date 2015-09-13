var request = require('request');
var ds18b20 = require('ds18b20');

var PASSWORD = 'tempSens';
var USERNAME = 'temperature-sensor';
var CLIENTID = 'iot';
var IP = "147.32.83.195:8443";

var sensorIDs = ds18b20.readSensorsIDs();

var Communication = function(){
  var token = null;
  var refreshTokenHash = null;
  var interval = null;
  
  this.startCommunication = function(){
    getToken(startPolling);
  };
  
  var getToken = function(successCallback){
    request.post({
    url: "https://"+IP+"/auth/realms/iot/protocol/openid-connect/token",
    form: {username:USERNAME,password:PASSWORD,client_id:CLIENTID,grant_type:'password'},
    rejectUnauthorized : false},
    function(err,httpResponse,body){
      if(err !== null){
        console.log("An error occured, error message:");
        console.log(err);
      }else{
	var parsed = JSON.parse(body);
        token = parsed.access_token;
	refreshTokenHash = parsed.refresh_token;
	successCallback();
      }
    });
  };
  
  var refreshToken = function(successCallback){
    request.post({
    url: "https://"+IP+"/auth/realms/iot/protocol/openid-connect/token",
    form: {refresh_token:refreshTokenHash,client_id:CLIENTID,grant_type:'refresh_token'},
    rejectUnauthorized : false},
    function(err,httpResponse,body){
      if(err !== null){
        console.log("An error occured at refreshing token, error message:");
        console.log(err);
	console.log("Trying to obtain new access token");
	getToken(successCallback);
      }else{
	var parsed = JSON.parse(body);
        token = parsed.access_token;
	refreshTokenHash = parsed.refresh_token;
	successCallback();
      }
    });
  };
  
  var startPolling = function(){
    interval = setInterval(function(){sendTemperature(token);},5000);
  };
  
  var stopPolling = function(){
    clearInterval(interval);
  };
  
  var sendTemperature = function(token){
    ds18b20.temperature(sensorIDs[0], function(err, value) {
      request.post({
	url:"https://"+ IP +"/iot-hub-example/rest/temperature/add/" + value,
	  headers: { 'Authorization': 'Bearer '+token},
	rejectUnauthorized : false},
	  function(err,httpResponse,body){
	    if(err !== null || httpResponse.statusCode !== 201){
	      console.log("Temperature sending failed, retrying");
	      console.log("HTTP Response: "+httpResponse.statusCode);
	      stopPolling();
	      refreshToken(startPolling);
	    }else{
	      console.log('Current temperature is', value);
	    }
	  });
    });
  };
};

var com = new Communication();
com.startCommunication();
