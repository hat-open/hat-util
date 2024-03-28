import datetime
import sqlite3


def register_sqlite3_timestamp_converter():
    """Register modified timestamp converter

    This converter is modification of standard library convertor taking into
    account possible timezone info.

    """

    def convert_timestamp(val: bytes) -> datetime.datetime:
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

        val = datetime.datetime(year, month, day, hours, minutes, seconds,
                                microseconds, tz)
        return val

    sqlite3.register_converter("timestamp", convert_timestamp)
