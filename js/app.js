$(function() {

// COMINGSOON
    var date = {
        start: moment("2018/3/13 19:45:29 GMT+0200"),
        end: moment("2014/4/5 19:30:29 GMT+0200")
    };
    var millhour = 60 * 60 * 1000;
    var millminutes = 60 * 1000;
    var now = 0;
    var hours = 0;
    var minutes = 0;
    var progress = 0;
    var hoursEl = $('#hours');
    var minutsEl = $('#minutes');
    var progressEl = $('#progress');
    var dotsEl = $("#dots");

    var intervalID;

    $.ajax({
    	type: "HEAD",
    	url: '/index.html',
		complete: function(xhr) {
            date.now = moment(xhr.getResponseHeader('date'))
            timerInit(date);
        }
    });

    function timerInit(date) {
        date.left = date.end - date.now + 60000;
        date.summary = date.end - date.start;
        date.end = Math.floor(((new Date().getTime())) + date.left);
        date.start = Math.floor(date.end - date.summary);
        $('.start .text').text(moment(date.start).format('D MMM'));
        $('.end .text').text(moment(date.end).format('D MMM'));
        if (date.left > 60000) {
            timerReload(date, function(){
                progressEl.css('width', "100%");
                $('#counter').fadeIn(700);

                intervalID = setInterval(function(){
                    timerReload(date)
                }, 1000);
            });
        }else {
            setTimeout(function(){ location.reload(); }, 3000);
        }
    }

    function timerReload(date, callback) {
        var rest = 0;
        if (date.left > 60000) {
            now = (new Date().getTime());
            date.left = date.end - now;

            hours = Math.floor(date.left / millhour);
            hoursEl.html(hours);
            rest = date.left % millhour;

            minutes = Math.floor(rest / millminutes);
            minutsEl.html(minutes);
            rest = rest % millminutes;

            progress = (date.left / date.summary) * 100;
            progressEl.css('width', progress + "%");

            // $('#left').text(moment.duration(date.left).humanize()+ ' left');

            dotsEl               
                .queue(function() {
                    $(this).css('color', '#cacaca').dequeue()
                })
                .delay(200)
                .queue(function() {
                    $(this).css('color', '#4eb7cd').dequeue();
                })
        }else {
            location.reload();
        }
        if(callback){
            callback();
        }
        
    }

// WEBFORM
    var subscr = $('#subscribe');
    var form = $('#webform');
    var jsonObj = {
        'inputs': {},
        'config': {
            'formName': 'Subscribe',
            'saveData': 'true',
            'glob': {
                'response': 'you will be notified'
            },
            'error': {
                'global': {
                    'fail': 'failed, try again'
                }
            }
        }
    };

    subscr.hover(function() {
        $(this).toggleClass('opened closed');
    });

    $(form).submit(function(event) {
        event.preventDefault();
        $(this).find("input, textarea, select").each(function() {
            var element = $(this);
            var elname = element.attr("name");
            if (element.val()) {
                switch (element.attr("type")) {
                    case "checkbox":
                    case "radio":
                        if (element.is(":checked")) {
                            if (jsonObj.inputs[elname]) {
                                jsonObj.inputs[elname] += (", "+element.val());
                            } else {
                                jsonObj.inputs[elname] = element.val();
                            }
                        }
                        break;
                    default:
                        if (jsonObj.inputs[elname]) {
                            jsonObj.inputs[elname] += (", "+element.val());
                        } else {
                            jsonObj.inputs[elname] = element.val();
                        }
                        break;
                }
            }
        });
        sendJSON();
        return false;
    });

    function sendJSON() {
        $.ajax({
            url: '/',
            type: 'POST',
            dataType: "json",
            data: jsonObj,
            beforeSend: function() {
                subscr
                    .unbind("mouseenter mouseleave")
                    .children('.text').text('sending')
                    .parent().toggleClass('opened closed')
            },
            complete: function() {

            },
            success: function(data) {
                subscr.addClass('complete').removeClass('error')
                    .children('.text').text(jsonObj.config.glob.response)
            },
            error: function() {
                subscr.addClass('error')
                    .children('.text').text(jsonObj.config.error.global.fail)
                    .parent().delay(2000).queue(function() {
                            $(this).toggleClass('opened closed').dequeue();
                        });
            }
        });
        jsonObj.inputs = {};
    }
});
