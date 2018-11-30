# Here go your api methods.

@auth.requires_login()
@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
        post_author=auth.user.email,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


def get_post_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.post.ALL, orderby=~db.post.post_time)
        for row in rows:
            results.append(dict(
                id=row.id,
                post_title=row.post_title,
                post_content=row.post_content,
                post_author=row.post_author,
                thumb = None,
                up_hover=None,
                down_hover=None,
                p_thumb_count=None,
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.thumb.ALL,
                            left=[
                                db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
                            ],
                            orderby=~db.post.post_time)

        for row in rows:
            results.append(dict(
                id=row.post.id,
                post_title=row.post.post_title,
                post_content=row.post.post_content,
                post_author=row.post.post_author,
                thumb=None if row.thumb.id is None else row.thumb.thumb_state,
                up_hover=False,
                down_hover=False,
                p_thumb_count=calc_count(row.post.id),
                post_time=row.post.post_time,

            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))


def get_reply_list():
    results = []
    rows = db().select(db.reply.ALL, orderby=~db.reply.id)
    for row in rows:
        results.append(dict(
            id=row.id,
            reply_author=row.reply_author,
            reply_content=row.reply_content,
            post_id=row.post_id,
            _editing=False,
            reply_time=row.reply_time,
        ))
    return response.json(dict(reply_list=results))

@auth.requires_login()
def add_reply():
    time = get_current_time()
    reply_id = db.reply.insert(
        post_id=request.vars.post_id,
        reply_content=request.vars.reply_content,
        reply_author=auth.user.email,
        reply_time=time,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(reply_id=reply_id, time=time))



def calc_count(p_id):
    count = int(0)
    rows = db((db.thumb.post_id == p_id) & (db.thumb.user_email != auth.user.email)).select()
    for row in rows:
        if row.thumb_state == 'u':
            count += 1
        elif row.thumb_state == 'd':
            count -= 1
    return count


@auth.requires_login()
@auth.requires_signature()
def set_thumb():
    post_id = int(request.vars.post_id)
    state = request.vars.thumb_state
    if state == '':
        db((db.thumb.post_id == post_id) & (db.thumb.user_email == auth.user.email)).delete()

    else:
        db.thumb.update_or_insert(
            (db.thumb.post_id == post_id) & (db.thumb.user_email == auth.user.email),
            post_id=post_id,
            user_email=auth.user.email,
            thumb_state=state,
        )
    return "ok" # Might be useful in debugging.




@auth.requires_signature()
def set_post():
    time = request.vars.time
    db.post.update_or_insert(
        (db.post.post_time == time) & (db.post.post_author == auth.user.email),
        post_title=request.vars.title,
        post_content=request.vars.content,
    )

    return "set_post done"

@auth.requires_signature()
def set_reply():
    time = request.vars.reply_time
    db.reply.update_or_insert(
        (db.reply.reply_time == time) & (db.reply.reply_author == auth.user.email),
        reply_content=request.vars.reply_content,
    )

    return "set_reply done"



@auth.requires_signature()
def add_reminder():
    repeat_bool = request.vars.repeat_bool
    reminder_id = db.reminder.insert(
        reminder_title=request.vars.reminder_title,
        start_date=request.vars.start_date,
        end_date=request.vars.end_date,
        reminder_author=auth.user.email,
        allday=request.vars.allday,
        days_of_week=request.vars.dow,
        repeat_bool=request.vars.repeat_bool,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(reminder_id=reminder_id, repeat_bool=repeat_bool))


@auth.requires_signature()
def add_chore():
    chore_id = db.chore.insert(
        chore_title=request.vars.chore_title,
        chore_author=auth.user.email,
        sun="",
        mon="",
        tue="",
        wed="",
        thu="",
        fri="",
        sat="",
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(chore_id=chore_id))


def get_reminder_list():
    results = []
    rows = db().select(db.reminder.ALL, orderby=~db.reminder.id)
    for row in rows:
        results.append(dict(
            id=row.id,
            reminder_author=row.reminder_author,
            reminder_title=row.reminder_title,
            start_date=row.start_date,
            end_date=row.end_date,
            allday=row.allday,
            days_of_week=row.days_of_week,
            repeat_bool=row.repeat_bool,
        ))
    return response.json(dict(reminder_list=results))


def get_chore_list():
    results = []
    rows = db().select(db.chore.ALL, orderby=~db.chore.id)
    for row in rows:
        results.append(dict(
            id=row.id,
            chore_title=row.chore_title,
            chore_author=row.chore_author,
            sun=row.sun,
            mon=row.mon,
            tue=row.tue,
            wed=row.wed,
            thu=row.thu,
            fri=row.fri,
            sat=row.sat,
        ))
    return response.json(dict(chore_list=results))

@auth.requires_signature()
def update_chore():
    title = request.vars.chore_title
    day = request.vars.day
    if day == '0':
        db((db.chore.chore_title == title),).update(
            sun="DONE",
        )
    elif day == '1':
        db((db.chore.chore_title == title), ).update(
            mon="DONE",
        )
    elif day == '2':
        db((db.chore.chore_title == title), ).update(
            tue="DONE",
        )
    elif day == '3':
        db((db.chore.chore_title == title), ).update(
            wed="DONE",
        )
    elif day == '4':
        db((db.chore.chore_title == title), ).update(
            thu="DONE",
        )
    elif day == '5':
        db((db.chore.chore_title == title), ).update(
            fri="DONE",
        )
    elif day == '6':
        db((db.chore.chore_title == title), ).update(
            sat="DONE",
        )
    return "update_chore done"


@auth.requires_signature()
def clear_chart():
    db(db.chore.for_clear == 'clear').update(
        sun="",
        mon="",
        tue="",
        wed="",
        thu="",
        fri="",
        sat="",
    )
    return "cleared chart"

@auth.requires_signature()
def edit_chore_title():
    db(db.chore.chore_title == request.vars.old_title).update(
        chore_title=request.vars.new_title,
    )

    return "edit_chore_title done"


@auth.requires_signature()
def delete_chore():
    db(db.chore.chore_title == request.vars.chore_title).delete()

    return "delete_chore done"



@auth.requires_signature()
def edit_reminder_name():
    title = request.vars.title
    start = request.vars.start
    db.reminder.update_or_insert(
        (db.reminder.reminder_title == title) & (db.reminder.start_date == start) &
        (db.reminder.reminder_author == auth.user.email),
        reminder_title=request.vars.new_title,
    )

    return "edit_reminder_name done"

@auth.requires_signature()
def remove_reminder():
    title = request.vars.title
    start = request.vars.start
    db((db.reminder.reminder_title == title) & (db.reminder.start_date == start)).delete()

    return "removed reminder"


