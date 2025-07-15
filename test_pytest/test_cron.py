import datetime

import pytest

from hat import util


@pytest.mark.parametrize('expr_str, expr', [
    ('* * * * *', util.cron.Expr(minute=util.cron.AllSubExpr(),
                                 hour=util.cron.AllSubExpr(),
                                 day=util.cron.AllSubExpr(),
                                 month=util.cron.AllSubExpr(),
                                 day_of_week=util.cron.AllSubExpr())),

    ('1 2-3 4,5 6,7-8 *', util.cron.Expr(
        minute=util.cron.ValueSubExpr(1),
        hour=util.cron.RangeSubExpr(2, 3),
        day=util.cron.ListSubExpr([util.cron.ValueSubExpr(4),
                                   util.cron.ValueSubExpr(5)]),
        month=util.cron.ListSubExpr([util.cron.ValueSubExpr(6),
                                     util.cron.RangeSubExpr(7, 8)]),
        day_of_week=util.cron.AllSubExpr()))
])
def test_parse(expr_str, expr):
    result = util.cron.parse(expr_str)
    assert result == expr


@pytest.mark.parametrize('expr_str', [
    '* * * *',
    '60 * * * *',
    '* 24 * * *',
    '* * 0 * *',
    '* * * 0 *',
    '* * * * 7'
])
def test_parse_invalid(expr_str):
    with pytest.raises(Exception):
        util.cron.parse(expr_str)


@pytest.mark.parametrize('expr_str, t_now, t_next', [
    ('* * * * *',
     datetime.datetime(1970, 1, 1),
     datetime.datetime(1970, 1, 1, minute=1))
])
def test_next(expr_str, t_now, t_next):
    expr = util.cron.parse(expr_str)
    result = util.cron.next(expr, t_now)
    assert result == t_next


@pytest.mark.parametrize('expr_str, t, success', [
    ('* * * * *',
     datetime.datetime(1970, 1, 1),
     True)
])
def test_match(expr_str, t, success):
    expr = util.cron.parse(expr_str)
    result = util.cron.match(expr, t)
    assert result == success
