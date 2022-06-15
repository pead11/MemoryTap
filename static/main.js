let buttonOn = false;
let startButtonOn = true;
let colored = -1;
let z = 0;

let score = 0;

// check if browser supports workers
if (typeof(Worker) == "undefined") {
	alert("This application might not work correctly on your browser. Please change to another browser.");
}

//create worker and set Event-listeners for messages and errors
const worker = new Worker("static/worker.js");
worker.addEventListener(
	'message',
	(message) => {
		if (typeof(message.data) == typeof(1)) {
			if (colored != -1) {
				document.getElementById(colored).removeAttribute("style");
				colored = -1;
			}
			if (message.data != -1) {
				delay_worker.postMessage(message.data);
				colored = message.data;
			}
			else {
				worker.postMessage(false);
				buttonOn = true;
			}
		}
		else {
			if(typeof(message.data) == typeof("string")) {
				document.getElementById(message.data).removeAttribute("style");
			}
			else {
				document.getElementById(message.data.id).style.backgroundColor = message.data.color;
			}
		}
});

worker.addEventListener(
	'error',
	function() {
		$('body').innerText = "A problem with the web worker occured. Please try again";
});


// create delay_worker
const delay_worker = new Worker("static/delay_worker.js");

delay_worker.addEventListener(
	'error',
	function() {
		$('body').innerText = "A problem with the delayed web worker occured. Please try again"
});

delay_worker.addEventListener(
	'message',
	(message) => {
		document.getElementById(message.data).style.backgroundColor = "purple";
	}
)


function init() {
	let order = [];
	let new_rans = 3;

	// set eventlisteners for buttons on the grid
	let element = document.getElementById('grid');
	let startButton = document.getElementById('start');
	let restartButton = document.getElementById('restart');
	element.addEventListener(
		// name of event
		'click', 
		// name of event-Listener
		(e) => {
			if (e.target != element) {
				if (buttonOn) {
					if (order[z] != e.target.id) {
						// game over
						worker.postMessage({id: e.target.id, color: "red"});
						buttonOn = false;
						document.getElementById("hidden_score").value = score;
						document.getElementById('game_over').style.display = "inline-block";
					}
					else {
						z++;
						//blink
						score++; 
						document.getElementById('score').innerText = /*"Score: " + */score;
						worker.postMessage({id: e.target.id, color: "green"});
						if (z == order.length) {
							//next level
							buttonOn = false;					
							worker.postMessage(true);
							startButtonOn = true;
							startButton.classList.remove('pressed');
						}
					}
				}
			}
	});
	startButton.addEventListener(
		'click',
		function() {
			if (startButtonOn) {
				startButtonOn = false;
				if (z != 0) {
					new_rans = 1
				}
				else {
					new_rans = 3
				}		
				
				startButton.classList.add('pressed')
				$.post(
					"/",
					{count: new_rans},
					function(data) {
						order = order.concat(data)
						worker.postMessage(order);
				});
			}
			z = 0
	});
	restartButton.addEventListener(
		'click',
		function() {
			document.getElementById('game_over').style.display = "none";
			buttonOn = false;
			worker.postMessage(true);
			startButtonOn = true;
			
			z = 0;
			order = [];
			score = 0;
			document.getElementById('score').innerText = /*"Score: " + */score;
			startButton.classList.remove('pressed');
		}
	)
}

document.addEventListener("DOMContentLoaded", init);
