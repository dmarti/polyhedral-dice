var command = '';
var autoState = true;
var cleared = false;

function dieRoll(max) {
	max = Math.floor(max)
	if (max < 1) {
		return 0;
	}
	const randomBuffer = new Uint32Array(1);
	window.crypto.getRandomValues(randomBuffer);
	let randomNumber = randomBuffer[0] / (0xffffffff + 1);
	return Math.floor(randomNumber * max) + 1;
}

function rollScores() {
	command = '';
	var scores = [];
	for (var i = 0; i < 6; i++) {
		var tmp = [];
		for (var j = 0; j < 4; j++) {
			tmp.push(dieRoll(6));
		}
		// take the top 3 of the 4 dice
		tmp = tmp.sort(function(a, b) { return b - a; });
		tmp.pop;
		var sum = 0;
		for (var j = 0; j < 3; j++) {
			sum += tmp[j]
		}
		scores.push(sum)
	}
	scores = scores.sort(function(a, b) { return b - a; });
	setDisplay(scores.join(', '));
}

function parseCommand() {
	// return (dice count, dice size, auto-roll possible) if the
	// current command is a valid dice expression,
	// false if it is not.
	var chunks = command.split('d');
	if (chunks.length != 2) {
		return false;
	}
	var nos = [parseInt(chunks[0]), parseInt(chunks[1]), false];
	if (isNaN(nos[0])) {
		nos[0] = 1;
	}
	if (isNaN(nos[1])) {
		return false;
	}
	if (autoState && (nos[1] == 4 || nos[1] == 6 || nos[1] == 8 || nos[1] == 10 || nos[1] == 12 || nos[1] == 20)) {
		nos[2] = true;
	}
	return(nos)
}

function setDisplay(s) {
	document.getElementById('display').innerHTML = s;
	var tmp = parseCommand();
	if (tmp) {
		if (tmp[2]) {
			doRoll();
		}
	}
	cleared = !!!s;
	return s;
}

function doRoll() {
	nos = parseCommand();
	if (!nos) {
		return;
	}
	command = '';
	var dCount = nos[0];
	var dSize = nos[1];
	var sum = 0;
	var result = [];
	for (var i = 0; i < dCount; i++) {
		var tmp = dieRoll(dSize);
		sum += tmp;
		result.push(tmp);
	}
	if (dCount > 1) {
		result = result.join('&#8203;+') + "&#8203;=" + sum;
	} else {
		result = sum;
	}
	setDisplay("Rolling " + dCount + "d" + dSize + "<br>" + result);
}

function doSword() {
	if (!cleared) {
		command = setDisplay('');
		return;
	}
	command = '1d20';
	doRoll();
	return false;
}

function toggleAuto() {
	autoState = !autoState;
	var el = document.getElementById('auto');
	if (autoState) {
		el.style.visibility = 'visible';
		localStorage.removeItem('noAuto');
	} else {
		el.style.visibility = 'hidden';
		localStorage.setItem('noAuto', 1);
	}
	var tmp = parseCommand();
	if (tmp[2]) {
		doRoll();
	}
}

function handleInput(c) {
	if (c == 'r') {
		doRoll();
		return;
	}
	if (c == 'a') {
		toggleAuto();
		return;
	}
	if (c == 'c') {
		command = setDisplay('');
		return;
	}
	if (c == 's' || c == '#') {
		rollScores()
		return;
	}
	if (c == 'p' || c == '%') {
		command = '1d100';
		doRoll();
		return;
	}
	if (c == 'd') {
		if (command.indexOf('d') > -1) {
			return;
		}
		command = command + c;
	}
	var i = parseInt(c);
	if (!isNaN(i)) {
		command = command + i;
	}
	setDisplay(command);
}

function handleButton(b) {
	var but = b.target;
	var tag = but.tagName.toLowerCase();
	if (but.tagName.toLowerCase() != 'button') {
		console.log("click on " + but.tagName);
		return;
	}
	var txt = but.id.substr(1);
	handleInput(txt);
}	

function handleKey(e) {
	if (e.altKey || e.ctrlKey) {
		return;
	}
	if (e.key == 'Enter' || e.key == 'r') {
		doRoll();
	} else {
		handleInput(e.key);
	}
}

function setup() {
	if (window.location.protocol != 'https:') {
		return;
	}
	if (localStorage.getItem('noAuto')) {
		autoState = true;
		toggleAuto();
	}
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js')
		.then(function(reg) {
			console.log('Registration succeeded. Scope is ' + reg.scope);
		}).catch(function(error) {
			console.log('Registration failed with ' + error);
		});
	}
}

window.addEventListener("keypress", handleKey, true);
window.addEventListener("click", handleButton, true);
window.addEventListener("load", setup, false);
