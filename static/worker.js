let true_start = true;

function setIntervalX(delay, repetitions, array) {
    self.postMessage(array[0]);
    let x = 1;
    let intervalID = setInterval(function () {
        self.postMessage(array[x]);

        if (++x === repetitions) {
            self.setTimeout(function() {
                self.postMessage(-1);}, delay)
            clearInterval(intervalID);
        }
        }, delay);
}

self.addEventListener(
    'message',
    (message) => {
        // sets the startbutton
        if (typeof(message.data) == typeof(true_start)) {
            true_start = message.data;
        }
        else {
            if (true_start == true) {
                round = message.data;
                setIntervalX(900, round.length, round);
            }
            else {
                self.postMessage(message.data);
                self.setTimeout(
                    function() {
                        self.postMessage(message.data.id);
                    },
                    200
                )
            }
        }
});