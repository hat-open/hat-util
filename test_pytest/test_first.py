from hat import util


def test_first():
    x = [1, 2, 3]
    assert util.first(x) == 1
    assert util.first([]) is None
    assert util.first(x, lambda x: x > 1) == 2
    assert util.first(x, lambda x: x > 3) is None
    assert util.first([], default=4) == 4


def test_first_example():
    assert util.first(range(3)) == 0
    assert util.first(range(3), lambda x: x > 1) == 2
    assert util.first(range(3), lambda x: x > 2) is None
    assert util.first(range(3), lambda x: x > 2, 123) == 123
    assert util.first({1: 'a', 2: 'b', 3: 'c'}) == 1
    assert util.first([], default=123) == 123
