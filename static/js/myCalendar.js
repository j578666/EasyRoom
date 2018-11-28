
var calendar_app = function(){
    var self = {};
    Vue.config.silent = false; // show all warnings


    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    $('#calendar').fullCalendar({
        height:500,
        header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,listMonth,addEventButton'
      },
        selectable:true,
        selectHelper:true,
        navLinks: true, // can click day/week names to navigate views
        editable: false,
        eventLimit: true, // allow "more" link when too many events
        eventClick: function(event, element) {

            if(event.color =='#0edc08'){
                var new_name = prompt('Event Title:', event.title);
                if(new_name) {
                    self.edit_reminder_name(event.title, event.start, new_name);
                    event.title = new_name;
                    $('#calendar').fullCalendar('updateEvent', event);
                }else if (new_name == ""){ //delete event
                    self.remove_reminder(event.title, event.start);
                    $('#calendar').fullCalendar( 'removeEvents', event._id );
                }
            }

        }
    });

    self.edit_reminder_name=function(title, start, new_title){
        start=moment(start).format('YYYY-MM-DD');

        $.post(edit_reminder_name_url,
            // Data we are sending.
            {
                title: title,
                start: start,
                new_title: new_title,
            })

    };


    self.add_reminder =function(){
     self.vue.show_reminder_form = false;
     $.web2py.disableElement($("#add-reminder"));
     var sent_title = self.vue.form_title; // Makes a copy
     var sent_start_date = self.vue.form_start_date;
     var sent_end_date = self.vue.form_end_date;
     var sent_start_time = self.vue.form_start_time;
     var sent_end_time = self.vue.form_end_time;
     var is_allday=true;




     //if specified time for multi-day
     if(self.vue.form_start_time!= "" && self.vue.form_end_date!=""){
         //sent_start_date = sent_start_date.concat(" ",sent_start_time,":00");
         //sent_end_date = sent_end_date.concat(" ",sent_end_time,":00");
         is_allday=false;
     }
     //if specified time for single-day
     else if(self.vue.form_start_time!= "" && self.vue.form_end_date == ""){
         //sent_end_date = sent_start_date.concat(" ",sent_end_time,":00");
         //sent_start_date = sent_start_date.concat(" ",sent_start_time,":00");
         is_allday=false;
     }
     //if no specified time for single-day
     else if(self.vue.form_start_time== "" && self.vue.form_end_date == ""){
         //sent_start_date = sent_start_date.concat(" 00:00:00");
         is_allday=true;
     }
     //if no specified time for multi-day
     else if(self.vue.form_start_time== "" && self.vue.form_end_date == ""){
         //sent_start_date = sent_start_date.concat(" 00:00:00");
         is_allday=true;
     }


     $.post(add_reminder_url,
            // Data we are sending.
            {
                reminder_title: sent_title,
                start_date: sent_start_date,
                end_date: sent_end_date,
                allday:is_allday,
            },
            // What do we do when the post succeeds?

            function (data) {
                $.web2py.enableElement($("#add-reminder"));
                // Clears the form.
                self.vue.form_title="";
                self.vue.form_start_date="";
                self.vue.form_end_date="";
                // Adds the reply to the list of replies.


                var new_reminder = {
                    id: data.reminder_id,
                    reminder_title: sent_title,
                    start_date: sent_start_date,
                    allday:is_allday,

                };

                self.vue.reminder_list.unshift(new_reminder);
                // We re-enumerate the array.
                //self.process_reminder();
                $('#calendar').fullCalendar('renderEvent', {
                title: sent_title,
                start: sent_start_date,
                end: sent_end_date,
                allDay:is_allday,
                color: '#0edc08',
                }, true);

            });
            self.vue.single_day = false;
            self.vue.multi_day = false;
            self.vue.choose_time=false;
            self.vue.time_options=false;

    };

    self.remove_reminder = function(title, start){
        start=moment(start).format('YYYY-MM-DD');
        $.post(remove_reminder_url,
            // Data we are sending.
            {
                title: title,
                start: start,
            })
    };


    self.get_reminders = function() {
        $.getJSON(get_reminder_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.reminder_list = data.reminder_list;
                // Post-processing.
                self.process_reminder();
                console.log("I got my reminder list");
            }
        );
    };

    self.process_reminder = function(){
     var author_color;
     var editable = false;
     enumerate(self.vue.reminder_list);
     self.vue.reminder_list.map(function (e) {
         if(current_user == e.reminder_author){
             author_color = '#0edc08';
             editable=true;
         }else{
             author_color = '#b91113';
             editable=false;
         }
         $('#calendar').fullCalendar('renderEvent', {
             title: e.reminder_title,
             start: e.start_date,
             end: e.end_date,
             allDay: e.allday,
             color: author_color,
             editable: editable,
         }, true);
     });
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_start_date:"",
            form_end_date:"",
            form_start_time:"",
            form_end_time:"",
            reminder_list: [],
            show_reminder_form: false,
            multi_day: false,
            show_options: false,
            single_day:false,
            choose_time: false,
            time_options: false,

        },
        methods: {
            add_reminder: self.add_reminder,
            process_reminder: self.process_reminder,
            edit_reminder_name: self.edit_reminder_name,
            remove_reminder: self.remove_reminder,
        }

 });

    self.get_reminders();
    return self;
};


var c_APP = null;

jQuery(function(){c_APP = calendar_app();});


