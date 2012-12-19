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

function log2(x) {
    return Math.log(x)/Math.log(2);
}

function load_map() {
    var map_elt = document.getElementById("map_div");

    // Map creation and option setting

    // Scale to aspect_ratio (width to height)
    var aspect_ratio = 4/3;
    var width = $(map_elt).width();
    var height = $(map_elt).height();
    if (width != 0 && height != 0) {
        if (width > height)
            width = height * aspect_ratio;
        else
            height = width / aspect_ratio;
        $(map_elt).width(width);
        $(map_elt).height(height);
    }

    the_map = new Microsoft.Maps.Map(map_elt,
                                     { credentials: get_credentials(),
                                       showMapTypeSelector: false } );

    // Set zoom base upon correspondence described here:
    // http://msdn.microsoft.com/en-us/library/bb259689.aspx
    //
    // wherein 512x512 pixels is zoom level 1, with an additional
    // doubling in resolution per zoom level.  So we zoom to the level
    // that is the next greatest necessary to fit the height 1:1.
    var zoom_level = Math.max(Math.ceil(log2(height / 512)) + 1, 1);
    var options = the_map.getOptions();
    options.zoom = zoom_level;

    the_map.setView(options);

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

            // type=normal -> 100 px wide pictures
            FB_do('/' + user.toString() + '/picture?type=normal', function(response) {
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
                name_row = name_row + ('<td align="center">' +
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
