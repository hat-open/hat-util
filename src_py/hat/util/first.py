from collections.abc import Callable, Iterable
import typing


T = typing.TypeVar('T')


def first(xs: Iterable[T],
          fn: Callable[[T], typing.Any] = lambda _: True,
          default: T | None = None
          ) -> T | None:
    """Return the first element from iterable that satisfies predicate `fn`,
    or `default` if no such element exists.

    Result of predicate `fn` can be of any type. Predicate is satisfied if it's
    return value is truthy.

    Args:
        xs: collection
        fn: predicate
        default: default value

    Example::

        assert first(range(3)) == 0
        assert first(range(3), lambda x: x > 1) == 2
        assert first(range(3), lambda x: x > 2) is None
        assert first(range(3), lambda x: x > 2, 123) == 123
        assert first({1: 'a', 2: 'b', 3: 'c'}) == 1
        assert first([], default=123) == 123

    """
    return next((i for i in xs if fn(i)), default)
