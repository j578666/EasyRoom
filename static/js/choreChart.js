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
        right: 'basicWeek,listWeek,month',
      },
        defaultView: 'basicWeek',
        selectable:true,
        selectHelper:true,
        navLinks: true, // can click day/week names to navigate views
        editable: false,
        eventLimit: true, // allow "more" link when too many events
        //displayEventTime: false,
        eventClick: function(event, element) {

        var answer = confirm("Chore Completed?");
        if (answer) {
            $('#calendar').fullCalendar( 'removeEvents',
                function(event){
                  var date_string = ((event.start)._d).toString();
                  var parse_date = date_string.split(" ");

                  var chore_date = parse_date[1] + parse_date[2]+ parse_date[3];
                  var today_string = (moment()._d).toString();
                  var parse_today = today_string.split(" ");
                  var today = parse_today[1]+parse_today[2]+parse_today[3];

                  console.log(chore_date);
                  console.log(today);
                  console.log (chore_date == today);
                  return chore_date == today;

                } );
        }

        }
    });

    /*
    self.edit_reminder_name=function(title, start, end, new_title){
        start=moment(start).format('YYYY-MM-DD');

        $.post(edit_reminder_name_url,
            // Data we are sending.
            {
                title: title,
                start: start,
                new_title: new_title,
            })

    };
    */

    self.should_delete = function (event){
      var date_string = ((event.start)._d).toString();
      var parse_date = date_string.split(" ");

      var chore_date = parse_date[1] + parse_date[2]+ parse_date[3];
      var today_string = (moment()._d).toString();
      var parse_today = today_string.split(" ");
      var today = parse_today[1]+parse_today[2]+parse_today[3];

      console.log(chore_date);
      console.log(today);
      console.log (chore_date == today);
      return chore_date == today;

    };


    self.add_chore_test = function (){
        var sent_title = self.vue.form_title;

      $('#calendar').fullCalendar('renderEvent', {
          title: sent_title,
          start: '00:00',
          dow: [ 1, 4 ],
      });

    };

    self.add_chore =function(){
     self.vue.show_chore_form = false;

     var checkboxes = document.getElementsByName("repeat");
     var arrayVal = [];
     for (var i= 0; i<checkboxes.length;i++)
     {
       if (checkboxes[i].checked === true)
       {
         arrayVal.push(checkboxes[i].value);
       }
     }

     var dow_array = arrayVal;
     arrayVal = [];

     $.web2py.disableElement($("#add-chore"));
     var sent_title = self.vue.form_title; // Makes a copy

     $.post(add_chore_url,
            // Data we are sending.
            {
                chore_title: sent_title,
                dow: dow_array.toString(),
            },
            // What do we do when the post succeeds?

            function (data) {
                $.web2py.enableElement($("#add-chore"));
                // Clears the form.
                self.vue.form_title="";

                var new_chore = {
                    id: data.chore_id,
                    chore_title: sent_title,
                    dow: dow_array,
                };

                self.vue.chore_list.unshift(new_chore);
                // We re-enumerate the array.

                $('#calendar').fullCalendar('renderEvent', {
                start:'2018-11-11',
                end:'11:00',
                title: sent_title,
                dow: dow_array,
                }, true);

            });

    };

    self.get_chores = function() {
        $.getJSON(get_chore_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.chore_list = data.chore_list;
                // Post-processing.
                self.process_chore();
                console.log("I got my chore list");
            }
        );
    };

    self.process_chore = function(){
     enumerate(self.vue.chore_list);
     self.vue.chore_list.map(function (e) {

         $('#calendar').fullCalendar('renderEvent', {
             start:'10:00',
             title: e.chore_title,
             dow: (e.days_of_week).split(","),
         }, true)
     })
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
            chore_list: [],
            show_chore_form: false,

        },
        methods: {
            add_chore: self.add_chore,
            process_chore: self.process_chore,
            get_chores: self.get_chores,
            should_delete: self.should_delete,

        }

 });

    self.get_chores();
    return self;
};


var APP = null;

jQuery(function(){APP = calendar_app();});