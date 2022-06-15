function init() {
    let input = document.getElementById('input');
    input.addEventListener('keyup', function() {
        $.get('/query?q=' + input.value, function(html) {
        document.getElementById('query').innerHTML = html;
        });
    });
}

document.addEventListener("DOMContentLoaded", init);