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








