import datetime
import typing


class AllSubExpr(typing.NamedTuple):
    pass


class ValueSubExpr(typing.NamedTuple):
    value: int


class RangeSubExpr(typing.NamedTuple):
    from_: ValueSubExpr
    to: ValueSubExpr


class ListSubExpr(typing.NamedTuple):
    subexprs: list[ValueSubExpr]


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
    return Expr(*(_parse_subexpr(i) for i in expr_str.split(' ')))


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


def _parse_subexpr(subexpr_str):
    if subexpr_str == '*':
        return AllSubExpr()

    if '-' in subexpr_str:
        from_str, to_str = subexpr_str.split('-')
        return RangeSubExpr(int(from_str), int(to_str))

    if ',' in subexpr_str:
        return ListSubExpr([int(i) for i in subexpr_str.split(',')])

    return ValueSubExpr(int(subexpr_str))


def _match_subexpr(subexpr, value):
    if isinstance(subexpr, AllSubExpr):
        return True

    if isinstance(subexpr, ValueSubExpr):
        return value == subexpr.value

    if isinstance(subexpr, RangeSubExpr):
        return subexpr.from_ <= value <= subexpr.to

    if isinstance(subexpr, ListSubExpr):
        return value in subexpr.subexprs

    raise ValueError('unsupported subexpression')
