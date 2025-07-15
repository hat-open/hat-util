from collections.abc import Collection
import datetime
import typing


class AllSubExpr(typing.NamedTuple):
    pass


class ValueSubExpr(typing.NamedTuple):
    value: int


class RangeSubExpr(typing.NamedTuple):
    from_: int
    to: int


class ListSubExpr(typing.NamedTuple):
    subexprs: Collection[ValueSubExpr | RangeSubExpr]


SubExpr: typing.TypeAlias = (AllSubExpr |
                             ValueSubExpr |
                             RangeSubExpr |
                             ListSubExpr)


class Expr(typing.NamedTuple):
    minute: SubExpr
    hour: SubExpr
    day: SubExpr
    month: SubExpr
    day_of_week: SubExpr


def parse(expr_str: str) -> Expr:
    subexpr_strs = expr_str.split()
    if len(subexpr_strs) != 5:
        raise ValueError('invalid number of subexpressions')

    return Expr(
        minute=_parse_subexpr(subexpr_strs[0], _parse_minute),
        hour=_parse_subexpr(subexpr_strs[1], _parse_hour),
        day=_parse_subexpr(subexpr_strs[2], _parse_day),
        month=_parse_subexpr(subexpr_strs[3], _parse_month),
        day_of_week=_parse_subexpr(subexpr_strs[4], _parse_day_of_week))


def next(expr: Expr,
         t: datetime.datetime
         ) -> datetime.datetime:
    t = t.replace(second=0, microsecond=0)

    while True:
        t = t + datetime.timedelta(minutes=1)

        if match(expr, t):
            return t


def match(expr: Expr,
          t: datetime.datetime
          ) -> bool:
    if t.second or t.microsecond:
        return False

    if not _match_subexpr(expr.minute, t.minute):
        return False

    if not _match_subexpr(expr.hour, t.hour):
        return False

    if not _match_subexpr(expr.day, t.day):
        return False

    if not _match_subexpr(expr.month, t.month):
        return False

    if not _match_subexpr(expr.day_of_week, t.isoweekday() % 7):
        return False

    return True


def _parse_subexpr(subexpr_str, value_parser):
    if subexpr_str == '*':
        return AllSubExpr()

    if ',' in subexpr_str:
        return ListSubExpr([_parse_subexpr(i, value_parser)
                            for i in subexpr_str.split(',')])

    if '-' in subexpr_str:
        from_str, to_str = subexpr_str.split('-')
        return RangeSubExpr(value_parser(from_str), value_parser(to_str))

    return ValueSubExpr(value_parser(subexpr_str))


def _match_subexpr(subexpr, value):
    if isinstance(subexpr, AllSubExpr):
        return True

    if isinstance(subexpr, ValueSubExpr):
        return value == subexpr.value

    if isinstance(subexpr, RangeSubExpr):
        return subexpr.from_ <= value <= subexpr.to

    if isinstance(subexpr, ListSubExpr):
        return any(_match_subexpr(i, value) for i in subexpr.subexprs)

    raise ValueError('unsupported subexpression')


def _parse_minute(value_str):
    value = int(value_str)
    if not (0 <= value <= 59):
        raise ValueError('invalid minute value')

    return value


def _parse_hour(value_str):
    value = int(value_str)
    if not (0 <= value <= 23):
        raise ValueError('invalid hour value')

    return value


def _parse_day(value_str):
    value = int(value_str)
    if not (1 <= value <= 31):
        raise ValueError('invalid day value')

    return value


def _parse_month(value_str):
    value = int(value_str)
    if not (1 <= value <= 12):
        raise ValueError('invalid month value')

    return value


def _parse_day_of_week(value_str):
    value = int(value_str)
    if not (0 <= value <= 6):
        raise ValueError('invalid day of week value')

    return value
