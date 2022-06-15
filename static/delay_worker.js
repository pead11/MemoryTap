self.addEventListener(
    'message', 
    (message) => {
        self.setTimeout(
            function() {
                self.postMessage(message.data);
            },
            400
        );
});