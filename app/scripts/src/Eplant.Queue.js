Eplant.queue = {
    _timer: null,
    _queue: [],
    add: function(fn, context, time) {
        var setTimer = function(time) {
            Eplant.queue._timer = setTimeout(function() {
                time = Eplant.queue.add();
                if (Eplant.queue._queue.length) {
                    setTimer(time);
                }
            }, time || 2);
        }

        if (fn) {
            Eplant.queue._queue.push([fn, context, time]);
            if (Eplant.queue._queue.length == 1) {
                setTimer(time);
            }
            return;
        }

        var next = Eplant.queue._queue.shift();
        if (!next) {
            return 0;
        }
        next[0].call(next[1] || window);
        return next[2];
    },
    clear: function() {
        clearTimeout(Eplant.queue._timer);
        Eplant.queue._queue = [];
    }
};