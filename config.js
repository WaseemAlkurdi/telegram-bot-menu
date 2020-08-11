var bot = module.parent.exports;

var init   = require('./init.js');


function loadConfigurationFile(filename = process.argv[2]){
	return new Promise(function(ok, fail){
		if(filename == undefined){
			fail("Configuration file not specified.");
		} else {
			bot.fs.readFile(filename, {encoding: 'utf-8'}, function(err,data){
			    if (err){
			    	fail(err.toString());
			    } else {
			    	var config_params = data.split("\n");
			        
			        var hasRoot = 0;
			        var last_string = "must be empty";
			        for(var i = 0; i < config_params.length; i++){
			        	last_string = config_params[i];
			        	if(config_params[i] != ""){
				        	var param = config_params[i].split(bot.init.DELIMITER);
				        	if(param.length < 3)
				        		fail("Incorrect configuration file");

				        	/* initialize menu */
							if(bot.init.menu[param[1]] == undefined)
								bot.init.menu[param[1]] = { 'values': [], 'parent': null, 'actions': [] };

							bot.init.menu[param[1]].values.push(param[2]);
							bot.init.menu[param[1]].parent = param[0];

							/* initialize actions in menu */
							if(bot.init.menu[param[2]] == undefined)
								bot.init.menu[param[2]] = { 'values': [], 'parent': param[1], 'actions': [] };
							
							if(param.length > 3){
								for(var j = 3; j < param.length; j++){
									try{
										bot.init.menu[param[2]].actions.push(JSON.parse(param[j]));
									} catch(e) {
										fail("Incorrect configuration file at \"" + param[2] + "\" actions (string number " + (i+1) + ")");
									}
								}
							}

				        	/* initialize buttons */
				        	if(bot.init.buttons[param[0]] == undefined){
				        		bot.init.buttons[param[0]] = [];

				        		var obj = {};
				        		obj[param[1]] = [];
				        		bot.init.buttons[param[0]].push(obj);
				        	}
				        	
				        	var flagKey = -1;
				        	for(var j = 0; j < bot.init.buttons[param[0]].length; j++){
								var keys = Object.keys(bot.init.buttons[param[0]][j]);
								for(var jj = 0; jj < keys.length; jj++){
									if(keys[jj] == param[1]){
										flagKey = j;
									}
								}
				        	}
				        	
				        	if(flagKey == -1){
				        		var obj = {};
				        		obj[param[1]] = [];
				        		bot.init.buttons[param[0]].push(obj);
				        		flagKey = bot.init.buttons[param[0]].length - 1;
				        	}

				        	bot.init.buttons[param[0]][flagKey][param[1]].push(param[2]);

				        	/* check root parent */
				        	if(param[0] == "root"){
				        		hasRoot = 1;
				        		bot.init.menu_root = param[1];
				        	}
				        }
					}

					if(!hasRoot)
						fail("No root catalog in menu at parent position");

					checkEmptyStringInConfig(last_string, filename).then(() => {
						ok();
					}, error => {
						fail(error);
					});
			    }
			});
		}
	});
}
module.exports.loadConfigurationFile = loadConfigurationFile;

function checkEmptyStringInConfig(str, filename){
	return new Promise(function(ok, fail){
		if(str != ""){
			// add empty string
			bot.exec("echo >> " + filename, function(error, out, err){
				if(error != null)
					fail("Error when add empty string to end of config file: " + error.toString());
				if(err != "")
					fail("Error when add empty string to end of config file: " + err.toString());

				ok();
			});
		} else {
			ok();
		}
	});
}

// This function checks the sanity of the parameter=value pairs that were
// specified on the command line. This is done to account for things
// like parameter= (without a value), a sole = sign (no parameter or value)
// , or =value (without a parameter).
function checkCommandlinePairSanity(){
	return new Promise(function(ok, fail){
		var hits = [];
		for(var i = 0; i < process.argv.length; i++){
				// is the parameter a lone equal sign, and does it have an equal sign?
				if (process.argv[i] != "=" && process.argv[i].indexOf("=") != -1){
					// if it does:
					// the parameter is the part before the equals sign ...
					var parameter = process.argv[i].split("=")[0];
					if (parameter == "") {
						hits[i] = "Parameter without a value: " + process.argv[i]
					}
					// ... while the value is the part after it.
					var value = process.argv[i].split("=")[1];
					if (value == ""){
						hits[i] = "Value without a parameter: " + process.argv[i]
					}
				} else if (process.argv[i] == "="){
					hits[i] = "Lone = sign"
				}
			}
			if (hits.length > 0) {
				fail(hits);
			} else {
				ok();
			}
	});
		return hits;
}

module.exports.checkCommandlinePairSanity = checkCommandlinePairSanity;

// This function gets the value associated with a parameter that was specified
// on the command line.
function getCommandlineParameterValue(requestedParameter){
	for(var i = 0; i < process.argv.length; i++){
		/* for future use: if we want to do GNU-style arguments
		if (process.argv[i].indexOf("--") != -1){
			console.log("GNU-style argument detected!")
		}*/
		var parameter = process.argv[i].split("=")[0];
		var value = process.argv[i].split("=")[1];
		if (parameter == requestedParameter && value != "" && value != undefined) {
			return value;
		}
	}
}

// This function loads what I called the "customization file". This file
// would allow the user to change the delimiter, default prompts, and so
// forth, as zZoMROT envisaged in their original "to-do" list.
function loadCustomizationFile(){
	return new Promise(function(ok,fail){
		var filename = getCommandlineParameterValue("cust_file");
		// the filename can be either "not specified", "empty string", or an actual filename:
		if (filename == undefined){
				// Tell the user that the customization file wasn't specified, but don't stop.
				console.log("INFO:","Customization file is not specified. Falling back on hardcoded values.");
				ok();
		} else if (filename == ""){
			fail("ERROR: Please specify a file path after the equals sign in cust_file= .");
		} else if (filename != undefined) {
			console.log("INFO:", "Customization file specified!", filename);
			bot.fs.exists(filename, function (exists) {
			if(!exists)
				fail("ERROR: Customization file \""+filename+"\" doesn't exist, check the path and try again.");
			});

			// TODO: Make the program actually stop when failing to find a file.
			bot.fs.readFile(filename, {encoding: 'utf-8'}, function(err,data){
				if (err){
					fail(err.toString());
				}
				// JSON is a blessing.
				if (JSON.parse(data).delimiter != undefined) {
					// note that we're printing the value of the variable that
					// the program will use, as opposed to the line being read
					// from the JSON file. This is to let the user (and the dev!)
					// make sure that the bot is actually succeeding in loading
					// the value from the file.
					init.DELIMITER = JSON.parse(data).delimiter;
					console.log("INFO:", "Using custom delimiter:", init.DELIMITER);
				}
				if (JSON.parse(data).token != undefined) {
					init.TOKEN = JSON.parse(data).token;
					// The token is sensitive data, therefore, we don't print it
					// to the terminal.
					console.log("INFO:", "Read token from file");
				}
				if (JSON.parse(data).start_message != undefined) {
				init.TOKEN = JSON.parse(data).start_message;
					console.log("Using custom start message:", init.MSG_START);
				}
				if (JSON.parse(data).proxy != undefined
					&& (JSON.parse(data).proxy.port != undefined
						&& JSON.parse(data).proxy.host != undefined)) {
				init.proxy = JSON.parse(data).proxy;
				console.log("Using a proxy host:", init.proxy.host);
				console.log("Using a proxy port:", init.proxy.port);
				} else if (JSON.parse(data).proxy.host == undefined
					&& JSON.parse(data).proxy.port != undefined) {
					fail("ERROR: You have specified a proxy port, but you haven't specified a proxy host. \
						Please specify one in the customization file \"" + filename + "\".");
				} else if (JSON.parse(data).proxy.host != undefined
					&& JSON.parse(data).proxy.port == undefined) {
					fail("ERROR: You have specified a proxy host, but you haven't specified a proxy port. \
						Please specify one in the customization file \"" + filename + "\".");
				}
				// for future customization file generation option --generate-cust-file:
				/*console.log(JSON.stringify({
					token: init.TOKEN,
					delimiter: init.DELIMITER,
					start_message: init.MSG_START,
					proxy: init.proxy
				}));*/
				ok();
			}, error => {
				fail(error);
			});
		}
	});
}
module.exports.loadCustomizationFile = loadCustomizationFile;


function getDataFolder(){
	return new Promise(function(ok, fail){
		if(process.argv[3] == undefined)
			fail("No data folder");
		
		bot.fs.exists(process.argv[3], function (exists) { 
			if(!exists)
				fail("Data folder \""+process.argv[3]+"\" doesn't exist, create it yourself");

			bot.init.DATA_FOLDER = process.argv[3];
			ok();
		});
	});
}
module.exports.getDataFolder = getDataFolder;

function checkMode(){
	return new Promise(function(ok, fail){
		if(process.argv[4] != undefined){
			if(process.argv[4] != "edit"){
				fail("Unknown mode");
			} else {
				bot.init.MODE = 1;

				// Check Admins
				bot.init.admins = getAdmins();
			}
		}
		ok();
	});
}
module.exports.checkMode = checkMode;

function getAdmins(){
	var admins = [];
	if(process.argv[5] != undefined && process.argv[4] != "all"){
		admins = process.argv[5].split(",");
		for(var i = 0; i < admins.length; i++){
			if(admins[i][0] == "@")
				admins[i] = admins[i].slice(1);
		}
	}
	return admins;
}
