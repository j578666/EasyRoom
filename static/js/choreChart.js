
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
            Vue.set(e, '_exist', true);
        });
    };

    self.toggle_form = function(){
        self.vue.show_form = !self.vue.show_form;
    };


    self.update_checkbox = function (check){
        console.log("update_checkbox", check);

    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            chore_list: [],
            show_form: false,
        },
        methods: {
            add_chore: self.add_chore,
            get_chores: self.get_chores,
            process_chores: self.process_chores,
            toggle_form: self.toggle_form,
            update_checkbox: self.update_checkbox,
        }
    });

    self.get_chores();
    return self;
};

var APP = null;

jQuery(function(){APP = app();});