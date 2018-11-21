$(document).ready(function() {

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
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        customButtons: {
        addEventButton: {
          text: 'Add Event',
          click: function() {
            var dateStr = prompt('Enter a date in YYYY-MM-DD format');
            var date = moment(dateStr);
            var eventStr = prompt("Enter event name");
            var event_name = moment(eventStr);
            if (date.isValid()) {
              $('#calendar').fullCalendar('renderEvent', {
                title: event_name,
                start: date,
                allDay: true
              });
              alert('Great. Now, update your database...');
            } else {
              alert('Invalid date.');
            }
          }
        }
      },

    });
  });

add_event= function(){
  $.post(add_event_url,{

         });
};
