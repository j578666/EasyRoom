# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.




# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()


db.define_table('post',
                Field('post_author', default=get_user_email()),
                Field('post_title'),
                Field('post_content', 'text'),
                Field('post_time', 'datetime'),
                Field('post_name'),
                Field('house_name'),
                )


# Thumbs
db.define_table('thumb',
                Field('user_email'), # The user who thumbed, easier to just write the email here.
                Field('post_id', 'reference post'), # The thumbed post
                Field('thumb_state'), # This can be 'u' for up or 'd' for down, or None for... None.
                )

db.define_table('reply',
                Field('post_id', 'reference post'),
                Field('reply_author'),
                Field('reply_content', 'text'),
                Field('reply_time', 'datetime', default=get_current_time()),
                Field('reply_name'),
                )

db.define_table('reminder',
                Field('reminder_title'),
                Field('reminder_author'),
                Field('start_date'),
                Field('end_date'),
                Field('allday'),
                Field('days_of_week'),
                Field('repeat_bool', 'boolean'),
                Field('house_name'),
                )

db.define_table('chore',
                Field('chore_author'),
                Field('chore_title'),
                Field('sun'),
                Field('mon'),
                Field('tue'),
                Field('wed'),
                Field('thu'),
                Field('fri'),
                Field('sat'),
                Field('house_name'),
                Field('assigned'),
                )

db.define_table('payment_request',
                Field('request_time', 'datetime', default=get_current_time()),
                Field('request_reason'),
                Field('request_amount'),
                Field('request_due_date'),
                Field('request_from'),
                Field('request_to'),
                Field('request_person'),
                Field('request_self'),
                )