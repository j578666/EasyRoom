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

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        self.toggle_form();
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy 
        var sent_content = self.vue.form_content; // 
        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_content: self.vue.form_content,
                house_name: self.vue.house_name,
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-post"));
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_content = "";
                // Adds the post to the list of posts. 
                var new_post = {
                    id: data.post_id,
                    post_title: sent_title,
                    post_content: sent_content,
                    post_author: current_user,
                    down_hover: false,
                    up_hover: false,
                    post_time: data.post_time,
                    post_name: current_user_name,
                    _exist: true,
                    house_name: self.vue.house_name,
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        // If you put code here, it is run BEFORE the call comes back.

    };

    self.get_posts = function() {
        $.getJSON(get_post_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };

    self.process_posts = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts. 
        // We add the _idx attribute to the posts. 
        enumerate(self.vue.post_list);
        // We initialize the smile status to match the like. 
        self.vue.post_list.map(function (e) {
            Vue.set(e, '_up', e.thumb == 'u');
            Vue.set(e, '_down', e.thumb =='d');
            Vue.set(e, '_thumb_count', self.total_count(e));
            Vue.set(e, '_editing', false);
            Vue.set(e, '_show_reply', false);
            Vue.set(e, '_show_reply_form', false);
            Vue.set(e, '_exist', true);
        });
    };

     self.process_replies = function() {
        // This function is used to post-process replies, after the list has been modified
        // or after we have gotten new replies.
        // We add the _idx attribute to the replies.
        enumerate(self.vue.reply_list);
        // We initialize the smile status to match the like.
        self.vue.reply_list.map(function (e) {

        });
    };


    self.total_count = function(e){
        let t_count = 0;
        if (e.p_thumb_count !=null){
            t_count = e.p_thumb_count;
        }
        return self.update_count(e, t_count)
    };

    //update count to include current user's thumbs-up/down
    self.update_count = function (e, count){
        if (e.thumb =='u'){
            count += 1;
        }else if (e.thumb=='d'){
            count -= 1;
        }
        return count;
    };


    self.up_mouseover = function (post_idx) {
        //Depending on the current state, indicate the effect.
        var p = self.vue.post_list[post_idx];
        p.up_hover = true;
        p.down_hover = false;

        if (p.thumb == null){
            p._up = true;
        }else if (p.thumb == 'u'){
            p._up = true;
            p._down = false;
        }

        else{ //p.thumb ='d'
           p._up = true;
           p._down = false;
        }

    };

    self.down_mouseover = function (post_idx) {
        //Depending on the current state, indicate the effect.
        var p = self.vue.post_list[post_idx];

        p.up_hover = false;
        p.down_hover = true;

        if (p.thumb == null){
            p._down = true;
        }else if (p.thumb == 'd'){
            p._up = false;
            p._down = true;
        }

        else{ //p.thumb = 'u'
            p._up = false;
            p._down = true;
        }

    };

    self.up_click = function (post_idx) {
         // The thumbs-up is toggled, update count accordingly
        var p = self.vue.post_list[post_idx];

        let state=null;
        if (p.thumb == 'u'){
            p._up = false;
            state = null;
            p.thumb = null;
            p._thumb_count -=1;
        }else if (p.thumb == 'd'){
            p._up = true;
            p._down = false;
            state = 'u';
            p.thumb = 'u';
            p._thumb_count +=2;
        }else{
            p._up = true;
            p._down = false;
            state = 'u';
            p.thumb = 'u';
            p._thumb_count +=1;
        }

        // We need to post back the change to the server.
        $.post(set_thumb_url, {
            post_id:p.id,
            thumb_state:state,
        }); // Nothing to do upon completion.
    };

    self.down_click = function (post_idx) {
        // The thumbs-down is toggled, update count accordingly

        var p = self.vue.post_list[post_idx];

        let state = null;
        if (p.thumb == 'd'){
            p._down = false;
            state = null;
            p.thumb = null;
            p._thumb_count +=1;
            p.thumb_count +=1;
        }else if (p.thumb =='u'){
            p._down = true;
            p._up = false;
            state = 'd';
            p.thumb = 'd'
            p._thumb_count -=2;
            p.thumb_count -=2;
        }else{
             p._down = true;
            p._up = false;
            state = 'd';
            p.thumb = 'd'
            p._thumb_count -=1;
            p.thumb_count -=1;
        }

        // We need to post back the change to the server.
        $.post(set_thumb_url, {
            post_id: p.id,
            thumb_state: state,
        }); // Nothing to do upon completion.

    };


    self.mouseout = function (post_idx) {
        // The thumb and thumb_status coincide again.
        var p = self.vue.post_list[post_idx];

        p.up_hover = false;
        p.down_hover = false;

        if(p.thumb == 'd'){
            p._down = true;
            p._up = false;
        }else if ( p.thumb == 'u'){
            p._up = true;
            p._down = false;
        }else{
            p._up = false;
            p._down = false;
        }

    };


    self.edit_post = function(post_idx){
         var p = self.vue.post_list[post_idx];
         p._editing = true;
    };

    self.submit_post_edit = function(post_idx){
         var p = self.vue.post_list[post_idx];
         p._editing = false;

         $.post(set_post_url,{
             title: p.post_title,
             content: p.post_content,
             time: p.post_time,
         });
    };

    self.show_reply = function(post_idx){
         var p = self.vue.post_list[post_idx];
         p._show_reply = true;

         $.getJSON(get_reply_list_url,
            function(data) {
                self.vue.reply_list = data.reply_list;
                self.process_replies();
            })
    };

    self.hide_reply = function(post_idx){
        var p = self.vue.post_list[post_idx];
         p._show_reply = false;
    };

    self.add_replys = function(post_idx){
        var p = self.vue.post_list[post_idx];
         p._show_reply_form = true;
    };

    self.submit_reply = function(post_idx, reply_content){
        $.web2py.disableElement($("#add-reply"));
        var p = self.vue.post_list[post_idx];
         p._show_reply_form = false;
         var sent_reply_content =reply_content;
        $.post(add_reply_url,
            // Data we are sending.
            {
                post_id: p.id,
                reply_content:reply_content
            },
            // What do we do when the post succeeds?

            function (data) {
                $.web2py.enableElement($("#add-reply"));
                // Clears the form.
                self.vue.reply_content="";
                // Adds the reply to the list of replies.

                var new_reply = {
                    id: data.reply_id,
                    reply_content: sent_reply_content,
                    reply_author: current_user,
                    post_id: p.id,
                    _editing: false,
                    reply_time:data.time,
                    reply_name: current_user_name,
                };
                self.vue.reply_list.unshift(new_reply);
                // We re-enumerate the array.
                self.process_replies();
            });
    };


    self.toggle_form = function(){
        self.vue.show_form = !self.vue.show_form;
    };


    self.get_pid = function (post_idx){
        var p = self.vue.post_list[post_idx];
        return p.id;
    };


    self.edit_reply = function (reply_id){
        var r = self.vue.reply_list[reply_id];
        r._editing = true;
    };

    self.submit_reply_edit = function (reply_id, reply_content){
        var r = self.vue.reply_list[reply_id];
        r._editing = false;

         $.post(set_reply_url,{
             reply_content:reply_content,
             reply_time:r.reply_time,
         });
    };

        self.delete_post= function(post_idx){
        var p = self.vue.post_list[post_idx];
        p._exist = false;

        $.post(delete_post_url,{
             title: p.post_title,
             content: p.post_content,
         });
    };

        self.get_house_name = function(){
        $.getJSON(get_house_name_url,
            function(data) {
                self.vue.house_name = data.house_name;
                self.process_posts();
                self.get_posts();
                // console.log("Initial Vue House name:",self.vue.house_name);
            }
        );
        //console.log("get_house_name called")
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_content: "",
            post_list: [],
            show_form: false,
            reply_list: [],
            reply_content: "",
            post_title_edit_form:"",
            post_content_edit_form:"",
            house_name:"",
        },
        methods: {
            add_post: self.add_post,
            up_mouseover: self.up_mouseover,
            down_mouseover: self.down_mouseover,
            mouseout: self.mouseout,
            up_click: self.up_click,
            down_click: self.down_click,
            toggle_form: self.toggle_form,
            update_count: self.update_count,
            total_count: self.total_count,
            edit_post: self.edit_post,
            submit_post_edit: self.submit_post_edit,
            show_reply: self.show_reply,
            hide_reply: self.hide_reply,
            add_replys: self.add_replys,
            submit_reply: self.submit_reply,
            get_pid: self.get_pid,
            edit_reply: self.edit_reply,
            process_replies: self.process_replies,
            submit_reply_edit: self.submit_reply_edit,
            delete_post: self.delete_post,
        }

    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        $("#add_post").show();
    }

    // Gets the posts.
    self.get_house_name();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});