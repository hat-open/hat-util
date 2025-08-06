import datetime


def sqlite3_adapt_datetime(val: datetime.datetime) -> str:
    """SQLite3 datetime adapter

    Adapter usage::

        sqlite3.register_adapter(datetime.datetime, sqlite3_adapt_datetime)

    """
    return val.isoformat(" ")


def sqlite3_convert_timestamp(val: bytes) -> datetime.datetime:
    """SQLite3 timestamp converter

    This converter is modification of standard library convertor taking into
    account possible timezone info.

    Converter usage::

        sqlite3.register_converter("timestamp", sqlite3_convert_timestamp)

    """
    datepart, timetzpart = val.split(b" ")
    if b"+" in timetzpart:
        tzsign = 1
        timepart, tzpart = timetzpart.split(b"+")
    elif b"-" in timetzpart:
        tzsign = -1
        timepart, tzpart = timetzpart.split(b"-")
    else:
        timepart, tzpart = timetzpart, None
    year, month, day = map(int, datepart.split(b"-"))
    timepart_full = timepart.split(b".")
    hours, minutes, seconds = map(int, timepart_full[0].split(b":"))
    if len(timepart_full) == 2:
        microseconds = int('{:0<6.6}'.format(timepart_full[1].decode()))
    else:
        microseconds = 0
    if tzpart:
        tzhours, tzminutes = map(int, tzpart.split(b":"))
        tz = datetime.timezone(
            tzsign * datetime.timedelta(hours=tzhours, minutes=tzminutes))
    else:
        tz = None

    dt = datetime.datetime(year, month, day, hours, minutes, seconds,
                           microseconds, tz)
    return dt
