
// This is the js for the default/index.html view.
var app = function() {

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

    self.add_chore = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-chore"));
        self.toggle_form();
        var sent_name = self.vue.form_title; // Makes a copy
        $.post(add_chore_url,
            // Data we are sending.
            {
                chore_title: self.vue.form_title,
                house_name: self.vue.house_name,
            },

            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-chore"));
                // Clears the form.
                self.vue.form_title = "";
                var new_chore = {
                    id: data.chore_id,
                    chore_title: sent_name,
                    chore_author: current_user,
                    sun:"",
                    mon:"",
                    tue:"",
                    wed:"",
                    thu:"",
                    fri:"",
                    sat:"",
                    house_name:self.vue.house_name,

                };
                self.vue.chore_list.unshift(new_chore);
                // We re-enumerate the array.
                self.process_chores();
            });
    };

    self.get_chores = function() {
        $.getJSON(get_chore_list_url,
            function(data) {
                self.vue.chore_list = data.chore_list;
                self.process_chores();
                console.log("I got my chore_list");
            }
        );
        console.log("I fired the get");
    };

    self.process_chores = function() {
        enumerate(self.vue.chore_list);
        self.vue.chore_list.map(function (e) {
            Vue.set(e, '_chore_title', e.chore_title);
            Vue.set(e, '_sun', e.sun ==="DONE");
            Vue.set(e, '_mon', e.mon ==="DONE");
            Vue.set(e, '_tue', e.tue ==="DONE");
            Vue.set(e, '_wed', e.wed ==="DONE");
            Vue.set(e, '_thu', e.thu ==="DONE");
            Vue.set(e, '_fri', e.fri ==="DONE");
            Vue.set(e, '_sat', e.sat ==="DONE");
            Vue.set(e, '_house_name', e.house_name);
            Vue.set(e, '_exist', e.house_name === self.vue.house_name);

            console.log("HouseName:",e.house_name);
            console.log("VUE HouseName:",self.vue.house_name);
        });


    };

    self.toggle_form = function(){
        self.vue.show_form = !self.vue.show_form;
    };


    self.update_checkbox = function (idx, day){
        if (confirm("Mark chore as complete?")){
             var c = self.vue.chore_list[idx];

           if(day===0){
               c._sun = true;
           }else if (day===1){
               c._mon = true;
           }else if (day===2){
               c._tue = true;
           }else if (day===3){
               c._wed = true;
           }else if (day===4){
               c._thu = true;
           }else if (day===5){
               c._fri = true;
           }else if (day===6){
               c._sat = true;
           }

           $.post(update_chore_url,
            // Data we are sending.
            {
                chore_title: c.chore_title,
                day:day,
                house_name: c.house_name,
            });

        }
    };
    self.clear_chart = function(){
        $.post(clear_chart_url,
            // Data we are sending.
            {
                house_name:self.vue.house_name,
            });
            self.vue.chore_list.map(function (e) {
            Vue.set(e, '_sun', false);
            Vue.set(e, '_mon', false);
            Vue.set(e, '_tue', false);
            Vue.set(e, '_wed', false);
            Vue.set(e, '_thu', false);
            Vue.set(e, '_fri', false);
            Vue.set(e, '_sat', false);
        });

    };

    self.prompt_edit_chore_title = function(idx){
        var c = self.vue.chore_list[idx];

        if(c.chore_author === current_user) {

            var new_name = prompt('Chore Title:', c._chore_title);
            if (new_name === "") {
                c._exist = false;
                self.delete_chore(c._chore_title, c.house_name);
            } else if (new_name) {
                self.edit_chore_title(c.chore_title, new_name, c.house_name);
                c._chore_title = new_name;
            }
        }
    };

    self.delete_chore = function(chore_title, house_name){
        $.post(delete_chore_url,
            // Data we are sending.
            {
                chore_title: chore_title,
                house_name: house_name,
            });
    };

    self.edit_chore_title = function(old_title, new_title, house_name){
        $.post(edit_chore_title_url,
            // Data we are sending.
            {
                old_title: old_title,
                new_title: new_title,
                house_name:house_name,
            });
    };

    self.get_house_name = function(){
        $.getJSON(get_house_name_url,
            function(data) {
                self.vue.house_name = data.house_name;
                self.process_chores();
                self.get_chores();
                 console.log("Initial Vue House name:",self.vue.house_name);
            }
        );
        console.log("get_house_name called")
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            chore_list: [],
            show_form: false,
            house_name:"",
        },
        methods: {
            add_chore: self.add_chore,
            get_chores: self.get_chores,
            process_chores: self.process_chores,
            toggle_form: self.toggle_form,
            update_checkbox: self.update_checkbox,
            clear_chart: self.clear_chart,
            prompt_edit_chore_title: self.prompt_edit_chore_title,
            edit_chore_title: self.edit_chore_title,
            delete_chore: self.delete_chore,
            get_house_name: self.get_house_name,
        }
    });
    self.get_house_name();
    //self.get_chores();
    return self;
};

var APP = null;

jQuery(function(){APP = app();});