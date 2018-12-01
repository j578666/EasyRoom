
var pay_app = function(){
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

     self.get_request = function(){
    	$.getJSON(get_request_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.request_list = data.request_list;
                // Post-processing.
                self.process_requests();
                console.log("I got my reqest list");
            }
        );
       
    };

    self.process_requests = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts. 
        // We add the _idx attribute to the posts. 
        enumerate(self.vue.request_list);
        // We initialize the smile status to match the like. 
        self.vue.request_list.map(function (e) {


        });
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

    self.pay = function(user_idx){
    	var p = self.vue.user_list[user_idx];

    	window.open('https://www.'+p.paypal, '_blank');
    };

    self.send_request_toggle = function(user_idx, name, email){
    	var p = self.vue.user_list[user_idx];
    	self.vue.show_request = true;
    	self.vue.selected_person = name;
    	self.vue.selected_email = email;
    };

    self.send_request = function(){

    	var req_re = self.vue.request_reason;
    	var req_am = self.vue.request_amount;
    	var req_du = self.vue.request_due;
    	var req_fr = self.vue.selected_email;
    	var req_to = self.vue.selected_person;
    	var req_se = self.vue.request_self;
        $.post(add_request_url, 
        {
            request_reason: self.vue.request_reason,
            request_amount: self.vue.request_amount,
            request_due: self.vue.request_due,
            request_to: self.vue.selected_email,
            request_person: self.vue.selected_person,
        }, 
        function (data) {
                // Clears the form.
                self.vue.selected_person = "";
           		self.vue.selected_email= "";
            	self.vue.request_reason= "";
            	self.vue.request_amount= "";
            	self.vue.request_due= "";
            	self.vue.request_self="";
                // Adds the post to the list of posts. 
                var new_request = {
                	id: data.req_id,
                    request_reason: req_re,
                    request_amount: req_am,
                    request_due: req_du,
                    request_from: req_fr,
                    request_self: data.req_s,
                    request_person: req_to,
                };
                self.vue.request_list.unshift(new_request);
                self.process_requests();
        });
    	self.vue.show_request = false;
    };

    self.delete_request = function(request_idx, email, reason){
    	self.vue.request_list.splice(request_idx,1);

    	$.post(delete_request_url,
    	{
    		request_from: email,
    		request_reason: reason,
    	});
    	
    };

   
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_list: [],
            request_list: [],
            show_request: false,
            selected_person: "",
            selected_email: "",
            request_reason: "",
            request_amount: "",
            request_due: "",
            request_self: "",
        },
        methods: {
 			pay: self.pay,
 			send_request: self.send_request,
 			send_request_toggle: self.send_request_toggle,
 			delete_request: self.delete_request,
        }
    });

   

    // Gets the users
    if(is_logged_in){
  	  self.get_user_list();
  	  self.get_request();
  	}
    return self;
};


var pay_APP = null;

jQuery(function(){pay_APP = pay_app();});