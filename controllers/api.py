# Here go your api methods.

@auth.requires_login()
@auth.requires_signature()
def add_post():
    current_time = get_current_time()
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
        post_author=auth.user.email,
        post_time=current_time,
        post_name=auth.user.first_name,
        house_name=request.vars.house_name,

    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id, post_time=current_time))


@auth.requires_login()
def get_post_list():
    results = []
    rows = db().select(db.post.ALL, db.thumb.ALL,
                       left=[
                           db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
                       ],
                       orderby=~db.post.post_time)

    for row in rows:
        if row.post.house_name == auth.user.HouseName:
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
                post_name=row.post.post_name,
                house_name=row.post.house_name

            ))

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
            reply_name=row.reply_name,
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
        reply_name=auth.user.first_name,
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
    return "ok"  # Might be useful in debugging.


@auth.requires_signature()
def set_post():
    db((db.post.post_time == request.vars.time) &
       (db.post.post_author == auth.user.email)).update(
        post_title=request.vars.title,
        post_content=request.vars.content,
    )

    return "set_post done"


@auth.requires_signature()
def delete_post():
    db((db.post.post_author == auth.user.email) & (db.post.post_title == request.vars.title) &
       (db.post.post_content == request.vars.content)).delete()

    return "delete_post done"


@auth.requires_signature()
def set_reply():
    time = request.vars.reply_time
    db((db.reply.reply_time == time) & (db.reply.reply_author == auth.user.email)).update(
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
        house_name=request.vars.house_name,
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
        house_name=request.vars.house_name,
        assigned=request.vars.assigned,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(chore_id=chore_id))


def get_reminder_list():
    house_name = "Empty"
    rows = db().select(db.auth_user.ALL, orderby=~db.auth_user.id)
    for row in rows:
        if row.email == auth.user.email:
            house_name = row.HouseName

    results = []
    rows = db().select(db.reminder.ALL, orderby=~db.reminder.id)
    for row in rows:
        if row.house_name == house_name:
            results.append(dict(
                id=row.id,
                reminder_author=row.reminder_author,
                reminder_title=row.reminder_title,
                start_date=row.start_date,
                end_date=row.end_date,
                allday=row.allday,
                days_of_week=row.days_of_week,
                repeat_bool=row.repeat_bool,
                house_name=row.house_name,
            ))
    return response.json(dict(reminder_list=results))


def get_chore_list():
    results = []
    rows = db().select(db.chore.ALL, orderby=~db.chore.id)
    for row in rows:

        if row.house_name == auth.user.HouseName:
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
                house_name=row.house_name,
                assigned=row.assigned,
            ))
    return response.json(dict(chore_list=results))


@auth.requires_signature()
def update_chore():
    title = request.vars.chore_title
    house_name = request.vars.house_name
    day = request.vars.day
    if day == '0':
        db((db.chore.chore_title == title) & (db.chore.house_name == house_name)).update(
            sun="DONE",
        )
    elif day == '1':
        db((db.chore.chore_title == title) & (db.chore.house_name == house_name)).update(
            mon="DONE",
        )
    elif day == '2':
        db((db.chore.chore_title == title) & (db.chore.house_name == house_name)).update(
            tue="DONE",
        )
    elif day == '3':
        db((db.chore.chore_title == title) & (db.chore.house_name == house_name)).update(
            wed="DONE",
        )
    elif day == '4':
        db((db.chore.chore_title == title) & (db.chore.house_name == house_name)).update(
            thu="DONE",
        )
    elif day == '5':
        db((db.chore.chore_title == title) & (db.chore.house_name == house_name)).update(
            fri="DONE",
        )
    elif day == '6':
        db((db.chore.chore_title == title) & (db.chore.house_name == house_name)).update(
            sat="DONE",
        )
    return "update_chore done"


@auth.requires_signature()
def clear_chart():
    db(db.chore.house_name == request.vars.house_name).update(
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
    db((db.chore.chore_title == request.vars.old_title) &
       (db.chore.house_name == request.vars.house_name)).update(
        chore_title=request.vars.new_title,
    )

    return "edit_chore_title done"


@auth.requires_signature()
def edit_assignment():
    db((db.chore.chore_title == request.vars.chore_title) &
       (db.chore.house_name == request.vars.house_name)).update(
        assigned=request.vars.new_assigned,
    )

    return "edit_assignment done"


@auth.requires_signature()
def delete_chore():
    db((db.chore.chore_title == request.vars.chore_title) &
       (db.chore.house_name == request.vars.house_name)).delete()

    return "delete_chore done"


@auth.requires_signature()
def edit_reminder_name():
    title = request.vars.title
    start = request.vars.start

    db((db.reminder.reminder_title == title) & (db.reminder.start_date == start) &
       (db.reminder.reminder_author == auth.user.email) & (db.reminder.house_name == request.vars.house_name)).update(
        reminder_title=request.vars.new_title,
    )

    return "edit_reminder_name done"


@auth.requires_signature()
def remove_reminder():
    title = request.vars.title
    start = request.vars.start
    db((db.reminder.reminder_title == title) & (db.reminder.start_date == start) &
       (db.reminder.house_name == request.vars.house_name)).delete()

    return "removed reminder"


# get user list (samehouse)
def get_user_list():
    results = []
    if auth.user is None:
        return "not logged"
    else:
        rows = db().select(db.auth_user.ALL, orderby=~db.auth_user.id)
        for row in rows:
            if auth.user.HouseName == row.HouseName:
                if auth.user.email != row.email:
                    results.append(dict(
                        house=row.HouseName,
                        first_name=row.first_name,
                        last_name=row.last_name,
                        paypal=row.PayPalMe,
                        email=row.email,
                        phone=row.Phone,
                    ))
    return response.json(dict(user_list=results))


@auth.requires_signature()
def add_request():
    req_id = db.payment_request.insert(
        request_reason=request.vars.request_reason,
        request_amount=request.vars.request_amount,
        request_due_date=request.vars.request_due,
        request_from=auth.user.email,
        request_to=request.vars.request_to,
        request_person=request.vars.request_person,
        request_self=auth.user.first_name,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(req_id=req_id, req_s=auth.user.first_name))


def get_request_list():
    results = []
    if auth.user is None:
        return "not logged"
    else:
        rows = db().select(db.payment_request.ALL, orderby=~db.payment_request.request_time)
        for row in rows:
            results.append(dict(
                request_reason=row.request_reason,
                request_amount=row.request_amount,
                request_due=row.request_due_date,
                request_from=row.request_from,
                request_to=row.request_to,
                request_person=row.request_person,
                request_self=row.request_self,
            ))
    return response.json(dict(request_list=results))


@auth.requires_signature()
def delete_request():
    db(
        db.payment_request.request_from == request.vars.request_from and db.payment_request.request_reason == request.vars.request_reason).delete()

    return "Deleted request"


@auth.requires_signature()
def get_house_name():
    return response.json(dict(house_name=auth.user.HouseName))
