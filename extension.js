// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");
const request = require("request");

const folderPath = vscode.workspace.workspaceFolders[0].uri.toString().split(":")[1];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

var langs = ["ADA", "GAS64", "GAS32", "AWK", "BF", "C", "C#", "C++03", "C++11", "C++14", "C++17", "C11", "Clang", "Clang++", "CBL", "COFFEE", "D", "DART", "F#", "FORTH", "F95", "GO", "Groovy", "HASK", "ICK", "JAVA11", "JAVA8", "KOTLIN", "Lisp", "LUA", "NASM", "NASM64", "OCAML", "PAS", "PERL", "PHP", "PIKE", "PRO", "PYPY2", "PYPY3", "PY2", "PY3", "RKT", "RUBY2", "RUST", "SCALA", "SCM", "SED", "SWIFT", "TCL", "TEXT", "TUR", "V8JS", "VB"];
var codes = [42, 58, 56, 43, 30, 9, 14, 2, 13, 33, 69, 72, 35, 36, 39, 45, 29, 37, 40, 49, 19, 16, 64, 15, 50, 74, 25, 67, 70, 22, 20, 62, 23, 10, 6, 5, 68, 47, 17, 18, 1, 8, 63, 21, 44, 52, 41, 60, 54, 38, 51, 24, 27, 34];

var langid = {};

for (let i = 0; i < langs.length; i++) langid[langs[i]] = codes[i];

// TODO: Use this Later smh
function get_user(){
	if (!fs.existsSync(folderPath + '/.dmoj/user.json')){
		vscode.window.showErrorMessage("No User Cache is Stored, Please run the Authenticate Command.");
		return false;
	} else {
		return JSON.parse(fs.readFileSync(folderPath + "/.dmoj/user.json", {encoding: "utf-8"}));
	}
};

function get_lang(lang){
	if (lang[0] === 'C'){
		if (lang[1] === 'P') {
			return "cpp";
		} else if (lang[1] === 'B') {
			return "cbl";
		} else if (lang[1] === 'L') {
			if (lang === "CLANGX") return "cpp";
			else return "c";
		} else if (lang[1] === 'C') {
			return "cpp";
		} else if (lang[1] === 'O') {
			return "coffee";
		} return "c"; // C and C11 Remain
	} else if (lang[0] == 'P') {
		if (lang[1] === 'Y') {
			return "py";
		} else if (lang[1] === 'A') {
			return "pas";
		} else if (lang[1] === 'H') {
			return "php";
		} else if (lang[1] === 'E' || lang[1] === 'R') {
			return "pl";
		} return "pike" // Pike Remains
	} else if (lang[1] === 'J') {
		return "java";
	} else if (lang[1] === 'K') {
		return "kt";
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// Completed (TO BE REMOVED)
	let hello_world = vscode.commands.registerCommand('dmojorganizer.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from DMOJOrganizer!');
	}); context.subscriptions.push(hello_world);
	
	// Completed
	let from_template = vscode.commands.registerCommand('dmojorganizer.fromTemplate', function() {
		if (!fs.existsSync(folderPath + '/current')) { // Create Folder if needed
			fs.mkdirSync(folderPath + '/current');
			vscode.window.showInformationMessage("Created Current Folder...");
		} if (!fs.existsSync(folderPath + '/templates')) { // Error Out if no template
			vscode.window.showErrorMessage("You don't have a templates folder. Please put your templates in there!");
			fs.mkdirSync(folderPath + '/templates');
		} else { // Excecute Normally
			// Get the Current Template Files
			vscode.window.showInputBox({prompt: "Choose your Language (File Ending)"}).then(language => {
				if (!fs.existsSync(folderPath + '/templates/template.' + language)) {
					vscode.window.showErrorMessage("You don't have this file.");
					vscode.window.showErrorMessage(folderPath + '/templates/template.' + language);
				} else { // Excecute Normally
					vscode.window.showInputBox({prompt: "What is the Problem Code"}).then(problem => {
						fs.copyFileSync(folderPath + '/templates/template.' + language, folderPath + '/current/' + problem + '.' + language);
						vscode.window.showInformationMessage("Created Your File (^ w ^)");
						vscode.window.showTextDocument(vscode.Uri.parse(folderPath + '/current/' + problem + '.' + language));
					});
				}
			});
		}
	}); context.subscriptions.push(from_template);

	// Functional
	let get_subs = vscode.commands.registerCommand('dmojorganizer.getSubs', function() {
		// Check if Cache Folder is Present - Functional
		
		if (!fs.existsSync(folderPath + '/.dmoj')) {
			vscode.window.showInformationMessage("Cache Folder Wasn't Present. Creating it...");
			fs.mkdirSync(folderPath + '/.dmoj');
		} if (!fs.existsSync(folderPath + '/.dmoj/user.json')) {
			vscode.window.showErrorMessage("User Cache Not Stored, please run Authenticate.");
		} else {
			// Get Problem Set, as it doesn't store Category REEEEEE - Functional
			request("https://dmoj.ca/api/problem/list", {json: true}, (err, res, body) => {
				if (err) vscode.window.showErrorMessage("SOMETHING DIED. SEND HELP");
				if (!err && res.statusCode == 200) {
					fs.writeFileSync(folderPath + '/.dmoj/problems.json', JSON.stringify(body));
				}
			});
			// Read SUBS - Functional
			let user = JSON.parse(fs.readFileSync(folderPath + '/.dmoj/user.json', {encoding: "utf-8"}));
			request("https://dmoj.ca/api/user/submissions/" + user.userName, {json: true}, (err, res, body) => {
				if (err) vscode.window.showErrorMessage("SOMETHING DIED. SEND HELP");
				if (!err && res.statusCode == 200) {
					var ac_subs = {}, ac = new Set();
					for (var key in body) {
						if (!ac.has(body[key]['problem'])){
							if (body[key]['result'] === "AC"){
								ac.add(body[key]['problem']);
								ac_subs[key] = body[key];
							}
						} // Output to File
					} fs.writeFileSync(folderPath + '/.dmoj/subs.json', JSON.stringify(ac_subs));
				}
			}); // RETRIEVE SUBS - NOT FUNCTIONA
			let subs = JSON.parse(fs.readFileSync(folderPath + '/.dmoj/subs.json', {encoding: "utf-8"}));
			let problems = JSON.parse(fs.readFileSync(folderPath + '/.dmoj/problems.json', {encoding: "utf-8"}));
			let keys = Object.keys(subs); let i = 1;
			if (!fs.existsSync(folderPath + "/solved")) {fs.mkdirSync(folderPath + "/solved");}
			var loop = setInterval(function(){	
				if (i === keys.length) {clearInterval(loop);}
				var code = keys[i-1]; var problem = subs[code]["problem"];
				var category = problems[subs[code]["problem"]]["group"]; var lang = get_lang(subs[code]["language"]);
				if (!fs.existsSync(folderPath + "/solved/" + category)) {fs.mkdirSync(folderPath + '/solved/' + category);}
				if (!fs.existsSync(folderPath + '/solved/' + category + '/' + problem + '.' + lang)){
					request("https://dmoj.ca/src/" + code + "/raw", {method: "GET", headers: {Authorization: "Bearer " + user["token"]}}, (err, resp, body) => {
						if (err) vscode.window.showErrorMessage("SOMETHING DIED SEND HELP");
						if (!err && resp.statusCode == 200){
							fs.writeFileSync(folderPath + '/solved/' + category + '/' + problem + "." + lang, body);
						}
					});
				}
				i++;
			}, 1000);
			vscode.window.showInformationMessage("Pulled/Updated All of Your AC Submissions (^ w ^)!");
		}
	}); context.subscriptions.push(get_subs);

	let authenticate = vscode.commands.registerCommand('dmojorganizer.Authenticate', function() {
		vscode.window.showInputBox({prompt: "Your DMOJ Authentication Token"}).then((res) => {
			try {
				request("https://dmoj.ca/user", {headers: {Authorization: "Bearer " + res}, method: "GET", followRedirect: true}, (err, resp, body) => {
					if (err) vscode.window.showErrorMessage("SOMETHING DIED");
					if (!err && resp.statusCode == 200) {
						var dict = {};
						vscode.window.showInformationMessage("Succesful Authorization");
						dict['token'] = res;
						vscode.window.showInputBox({prompt: "Your DMOJ Username"}).then((val) => {
							dict["userName"] = val;
							fs.writeFileSync(folderPath + '/.dmoj/user.json', JSON.stringify(dict));
						});
					}
				});
			} catch (error) {
				vscode.window.showErrorMessage("INVALID AUTH OR DEATH");
			}
		});
	}); context.subscriptions.push(authenticate);

	let submit = vscode.commands.registerCommand('dmojorganizer.Submit', function() {
		if (!fs.existsSync(folderPath + '/.dmoj/user.json')) {
			vscode.window.showErrorMessage("User Cache Not Stored, please run Authenticate.");
		} else {
			var token = JSON.parse(fs.readFileSync(folderPath + '/.dmoj/user.json', {"encoding": "utf-8"}));
			vscode.window.showInputBox({prompt: "Problem ID"}).then(problem => {
				vscode.window.showInputBox({prompt: "Language"}).then(lang => {
					var lid = langid[lang]; 
					request.post("https://dmoj.ca/problem/" + problem + "/submit",
						{headers: {Authorization: "Bearer " + token["token"]}, formData: {
							source: vscode.window.activeTextEditor.document.getText(),
							language: lid
						}, followAllRedirects: true}, (err, resp, body) => {
							if (err) vscode.window.showErrorMessage("Something Died Help.");
							if (!err && resp.statusCode == 200) {
								var id = parseInt(resp.toJSON().request.uri.path.split("/")[2]);
								var panel = vscode.window.createWebviewPanel("page", "Submit Status", vscode.ViewColumn.Beside);
								var loop = setInterval(function(){
									request("https://dmoj.ca/widgets/submission_testcases?id=" + id, {method: "GET", headers: {Authorization: "Bearer " + token["token"]}}, (err, resp, body) => {
										panel.webview.html = body;
										if ((body.documentElement.textContent || body.documentElement.innerText).indexOf("Final Score:") > -1) clearInterval(loop);
									});
								}, 1500);
								request("https://dmoj.ca/widgets/single_submission?id=" + id, {method: "GET", headers: {Authorization: "Bearer " + token["token"]}}, (err, resp, body) => {
									// TODO: Implement something to find the thing
									var status = "hello";
									vscode.window.showInformationMessage(status);
								});
							}
						});
				});
			});
		}
	}); context.subscriptions.push(submit);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
