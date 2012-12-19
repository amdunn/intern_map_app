var the_map;

var active_box = null;

function make_toggle_callback(box) {
    return function (e) {
        if (!(active_box === null)) {
            active_box.setOptions({ visible: false });
        }
        if (!(active_box === box)) {
            box.setOptions({ visible: true });
            active_box = box;
        } else {
            active_box = null;
        }
    };
}

function add_pin_infobox_toggle(pos, content) {
    var pin = new Microsoft.Maps.Pushpin(pos);
    var box = new Microsoft.Maps.Infobox(pos,
                                         { width: 100,
                                           height: 100,
                                           offset: new Microsoft.Maps.Point(0, pin.getHeight()),
                                           visible: false,
                                           htmlContent: content });
    Microsoft.Maps.Events.addHandler(pin, 'click',
                                     make_toggle_callback(box));


    the_map.entities.push(pin);
    the_map.entities.push(box);
}

function load_map() {
    the_map = new Microsoft.Maps.Map(document.getElementById("map_div"),
                                     { credentials: get_credentials(),
                                       showMapTypeSelector: false } );

    // dc_pos: lat-long position of Washington, DC
    // var dc_pos = new Microsoft.Maps.Location(38.8900, -77.0300);
    // add_pin_infobox_toggle(dc_pos,
    //                      '<div class="infobox">Washington, DC</div>');
}

// Simple function to call Facebook API and take action if no error
function FB_do(url, callback) {
    FB.api(url, function(response) {
        if (response && !response.error) {
            callback(response);
        }
    });
}

// XXX: error handling...
function get_user_data1(users, user_data, callback) {
    if (users.length == 0) {
        callback(user_data);
    } else {
        var user = users.pop();
        var user_datum = {};

        FB_do('/' + user.toString(), function(response) {
            user_datum.name = response.name;
            user_datum.profile_link = response.link;

            FB_do('/' + user.toString() + '/picture', function(response) {
                user_datum.pic_link = response.data.url;

                user_data.push(user_datum);

                get_user_data1(users, user_data, callback);
            });
        });
    }
}

function get_user_data(users, callback) {
    get_user_data1(users, [], callback);
}

function process_location(location, users) {
    if (location === 'Fail')
        return;

    FB_do('/' + location.toString(), function(response) {
        var city_name = response.name;
        var pos = new Microsoft.Maps.Location(response.location.latitude,
                                              response.location.longitude);
        
        get_user_data(users, function (user_data) {

            var pic_row = '';
            var name_row = '';
            for (var i = 0; i < user_data.length; i++) {
                var user_datum = user_data[i];
                // console.log(user_datum);

                pic_row = pic_row + ('<td>' +
                                     '<img src="' + user_datum.pic_link + '">' +
                                     '</td>');
                name_row = name_row + ('<td>' +
                                       '<a target="_blank" href="' + user_datum.profile_link + '">' + user_datum.name + '</a>' +
                                       '</td>');
            }

            var city_html = city_name + '<br>' +
                '<table>' +
                '<tr>' + pic_row + '</tr>' +
                '<tr>' + name_row + '</tr>' +
                '</table>';

            add_pin_infobox_toggle(pos, '<div class="infobox">' + city_html + '</div>');
        });
    });
}

function process_location_map(the_location_map) {
    for (var key in the_location_map) {
        process_location(key, the_location_map[key]);
    }
}
