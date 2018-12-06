var calendar_app = function () {
    var self = {};
    Vue.config.silent = false; // show all warnings


    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function (v) {
        var k = 0;
        return v.map(function (e) {
            e._idx = k++;
        });
    };

    $('#calendar').fullCalendar({
        height: 500,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,listMonth,addEventButton'
        },
        selectable: true,
        selectHelper: true,
        navLinks: true, // can click day/week names to navigate views
        editable: false,
        eventLimit: true, // allow "more" link when too many events
        eventClick: function (event, element) {

            if (event.color == '#0edc08') {
                console.log(event.is_repeat);
                var new_name = prompt('Event Title:', event.title);
                if (new_name) {
                    self.edit_reminder_name(event.title, event.start, new_name, event.allDay, event.is_repeat);

                    event.title = new_name;
                    $('#calendar').fullCalendar('updateEvent', event);
                    if (event.is_repeat === true) {
                        window.location.reload();
                    }


                } else if (new_name === "") { //delete event
                    self.remove_reminder(event.title, event.start, event.allDay, event.is_repeat);
                    $('#calendar').fullCalendar('removeEvents', event._id);
                }
            }

        }
    });

    self.edit_reminder_name = function (title, start, new_title, is_allday, repeat) {


        if (repeat === true) {
            start = moment(start).format('HH:mm');
        } else if (is_allday === true) {
            start = moment(start).format('YYYY-MM-DD');
        } else {
            start = moment(start).format('YYYY-MM-DD HH:mm');
        }
        $.post(edit_reminder_name_url,
            // Data we are sending.
            {
                title: title.toString(),
                start: start.toString(),
                new_title: new_title.toString(),
                house_name: self.vue.house_name,
            })

    };


    self.add_reminder = function () {

        console.log(self.vue.repeat_b);

        self.vue.show_reminder_form = false;
        $.web2py.disableElement($("#add-reminder"));
        var sent_title = self.vue.form_title; // Makes a copy
        var sent_start_date = self.vue.form_start_date;
        var sent_end_date = self.vue.form_end_date;
        var sent_start_time = self.vue.form_start_time;
        var sent_end_time = self.vue.form_end_time;

        if (self.vue.choose_time) {
            sent_start_date = sent_start_date + " " + sent_start_time;
            sent_end_date = sent_end_date + " " + sent_end_time;
        }
        var is_repeat = false;

        if (self.vue.repeat_b) {
            sent_start_date = sent_start_time;
            sent_end_date = sent_end_time;
            is_repeat = true;
        }
        var is_allday;

        //if specified time
        if (self.vue.form_start_time !== "") {
            is_allday = false;
        }
        //all day event
        else {
            is_allday = true;
        }

        var checkboxes = document.getElementsByName("repeat");
        var arrayVal = [];
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked === true) {
                arrayVal.push(checkboxes[i].value);
            }
        }

        var dow_array = arrayVal;
        if (sent_start_date === '') {
            sent_start_date = "00:00";
        }

        $.post(add_reminder_url,
            // Data we are sending.
            {
                reminder_title: sent_title,
                start_date: sent_start_date,
                end_date: sent_end_date,
                allday: is_allday,
                dow: dow_array.toString(),
                repeat_bool: is_repeat,
                house_name: self.vue.house_name,

            },
            // What do we do when the post succeeds?
            function (data) {
                $.web2py.enableElement($("#add-reminder"));
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_start_date = "";
                self.vue.form_end_date = "";
                self.vue.form_start_time = "";
                self.vue.form_end_time = "";
                // Adds the reply to the list of replies.

                var new_reminder;
                if (is_repeat) {
                    new_reminder = {
                        id: data.reminder_id,
                        reminder_title: sent_title,
                        start_date: sent_start_date,
                        allday: is_allday,
                        dow: dow_array,
                        is_repeat: is_repeat,
                        house_name: self.vue.house_name,

                    };
                } else {
                    new_reminder = {
                        id: data.reminder_id,
                        reminder_title: sent_title,
                        start_date: sent_start_date,
                        allday: is_allday,
                        is_repeat: is_repeat,
                        house_name: self.vue.house_name,
                    };
                }
                self.vue.reminder_list.unshift(new_reminder);

                if (is_repeat) {
                    $('#calendar').fullCalendar('renderEvent', {
                        title: sent_title,
                        start: sent_start_date,
                        end: sent_end_date,
                        allDay: is_allday,
                        color: '#0edc08',
                        dow: dow_array,
                        is_repeat: is_repeat,

                    }, true);

                } else {
                    $('#calendar').fullCalendar('renderEvent', {
                        title: sent_title,
                        start: sent_start_date,
                        end: sent_end_date,
                        allDay: is_allday,
                        color: '#0edc08',
                        is_repeat: is_repeat,
                    }, true);

                }
            });
        self.vue.single_day = false;
        self.vue.multi_day = false;
        self.vue.choose_time = false;
        self.vue.time_options = false;
        self.vue.repeat_b = false;

    };

    self.remove_reminder = function (title, start, is_allday, repeat) {
        if (repeat === true) {
            start = moment(start).format('HH:mm');
        } else if (is_allday === true) {
            start = moment(start).format('YYYY-MM-DD');
        } else {
            start = moment(start).format('YYYY-MM-DD HH:mm');
        }
        $.post(remove_reminder_url,
            // Data we are sending.
            {
                title: title,
                start: start,
                house_name: self.vue.house_name,
            })
    };


    self.get_reminders = function () {
        $.getJSON(get_reminder_list_url,
            function (data) {
                self.vue.reminder_list = data.reminder_list;
                self.process_reminder(self.vue.house_name);
                console.log("I got my reminder list");
            }
        );
    };

    self.process_reminder = function (house_name) {
        var author_color;
        var editable = false;
        enumerate(self.vue.reminder_list);

        console.log("process_reminder got house name:", house_name);

        self.vue.reminder_list.map(function (e) {
            console.log("actual house name:", e.house_name);
            //only load reminder of the same house

                if (current_user == e.reminder_author) {
                    author_color = '#0edc08';
                    editable = true;
                } else {
                    author_color = '#b91113';
                    editable = false;
                }

                if (e.repeat_bool) {
                    $('#calendar').fullCalendar('renderEvent', {
                        title: e.reminder_title,
                        start: e.start_date,
                        end: e.end_date,
                        allDay: e.allday,
                        color: author_color,
                        editable: editable,
                        dow: e.days_of_week,
                        is_repeat: e.repeat_bool,
                    }, true);

                } else {
                    $('#calendar').fullCalendar('renderEvent', {
                        title: e.reminder_title,
                        start: e.start_date,
                        end: e.end_date,
                        allDay: e.allday,
                        color: author_color,
                        editable: editable,
                        is_repeat: e.repeat_bool,
                    }, true);
                }
            }
        );

    };


    self.get_house_name = function () {
        $.getJSON(get_house_name_url,
            function (data) {
                self.vue.house_name = data.house_name;
                self.get_reminders();
            }
        );
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_start_date: "",
            form_end_date: "",
            form_start_time: "",
            form_end_time: "",
            reminder_list: [],
            show_reminder_form: false,
            multi_day: false,
            show_options: false,
            single_day: false,
            choose_time: false,
            time_options: false,
            repeat_b: false,
            house_name: "",

        },
        methods: {
            add_reminder: self.add_reminder,
            process_reminder: self.process_reminder,
            edit_reminder_name: self.edit_reminder_name,
            remove_reminder: self.remove_reminder,
        }

    });

    self.get_house_name();
    return self;
};

var APP = null;

jQuery(function () {
    APP = calendar_app();
});


