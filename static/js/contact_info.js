var info_app = function(){
    var self = {};
    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};
  
    self.get_user_list = function() {
        $.getJSON(get_user_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.user_list = data.user_list;
                // Post-processing.
                self.process_user();
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };



  
    self.process_user = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts. 
        // We add the _idx attribute to the posts. 
        enumerate(self.vue.user_list);
        // We initialize the smile status to match the like. 
        self.vue.user_list.map(function (e) {


        });
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_list: [],
            
        },
        methods: {

        }
    });

    // Gets the users
    if(is_logged_in){
  	  self.get_user_list();
  	}
    return self;
};


var info_APP = null;

jQuery(function(){info_APP = info_app();});