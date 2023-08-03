"""Common utility functions"""

import collections
import contextlib
import inspect
import socket
import typing
import warnings


T = typing.TypeVar('T')

Bytes: typing.TypeAlias = bytes | bytearray | memoryview


def register_type_alias(name: str):
    """Register type alias

    This function is temporary hack replacement for typing.TypeAlias.

    It is expected that calling location will have `name` in local namespace
    with type value. This function will wrap that type inside `typing.TypeVar`
    and update annotations.

    """
    warnings.warn("use typing.TypeAlias", DeprecationWarning)
    frame = inspect.stack()[1][0]
    f_locals = frame.f_locals
    t = f_locals[name]
    f_locals[name] = typing.TypeVar(name, t, t)
    f_locals.setdefault('__annotations__', {})[name] = typing.Type[t]


def first(xs: typing.Iterable[T],
          fn: typing.Callable[[T], typing.Any] = lambda _: True,
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


class RegisterCallbackHandle(typing.NamedTuple):
    """Handle for canceling callback registration."""

    cancel: typing.Callable[[], None]
    """cancel callback registration"""

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.cancel()


ExceptionCb: typing.TypeAlias = typing.Callable[[Exception], None]
"""Exception callback"""


class CallbackRegistry:
    """Registry that enables callback registration and notification.

    Callbacks in the registry are notified sequentially with
    `CallbackRegistry.notify`. If a callback raises an exception, the
    exception is caught and `exception_cb` handler is called. Notification of
    subsequent callbacks is not interrupted. If handler is `None`, the
    exception is reraised and no subsequent callback is notified.

    Example::

        x = []
        y = []
        registry = CallbackRegistry()

        registry.register(x.append)
        registry.notify(1)

        with registry.register(y.append):
            registry.notify(2)

        registry.notify(3)

        assert x == [1, 2, 3]
        assert y == [2]

    """

    def __init__(self,
                 exception_cb: ExceptionCb | None = None):
        self._exception_cb = exception_cb
        self._cbs = []  # type: list[Callable]

    def register(self,
                 cb: typing.Callable
                 ) -> RegisterCallbackHandle:
        """Register a callback."""
        self._cbs.append(cb)
        return RegisterCallbackHandle(lambda: self._cbs.remove(cb))

    def notify(self, *args, **kwargs):
        """Notify all registered callbacks."""
        for cb in self._cbs:
            try:
                cb(*args, **kwargs)
            except Exception as e:
                if self._exception_cb:
                    self._exception_cb(e)
                else:
                    raise


def get_unused_tcp_port(host: str = '127.0.0.1') -> int:
    """Search for unused TCP port"""
    with contextlib.closing(socket.socket()) as sock:
        sock.bind((host, 0))
        return sock.getsockname()[1]


def get_unused_udp_port(host: str = '127.0.0.1') -> int:
    """Search for unused UDP port"""
    with contextlib.closing(socket.socket(type=socket.SOCK_DGRAM)) as sock:
        sock.bind((host, 0))
        return sock.getsockname()[1]


class BytesBuffer:
    """Bytes buffer

    All data added to BytesBuffer is considered immutable - it's content
    (including size) should not be modified.

    """

    def __init__(self):
        self._data = collections.deque()
        self._data_len = 0

    def __len__(self):
        return self._data_len

    def add(self, data: Bytes):
        """Add data"""
        if not data:
            return

        self._data.append(data)
        self._data_len += len(data)

    def read(self, n: int = -1) -> Bytes:
        """Read up to `n` bytes

        If ``n < 0``, read all data.

        """
        if n == 0:
            return b''

        if n < 0 or n >= self._data_len:
            data, self._data = self._data, collections.deque()
            data_len, self._data_len = self._data_len, 0

        else:
            data = collections.deque()
            data_len = 0

            while data_len < n:
                head = self._data.popleft()
                self._data_len -= len(head)

                if data_len + len(head) <= n:
                    data.append(head)
                    data_len += len(head)

                else:
                    head = memoryview(head)
                    head1, head2 = head[:n-data_len], head[n-data_len:]

                    data.append(head1)
                    data_len += len(head1)

                    self._data.appendleft(head2)
                    self._data_len += len(head2)

        if len(data) < 1:
            return b''

        if len(data) < 2:
            return data[0]

        data_bytes = bytearray(data_len)
        data_bytes_len = 0

        while data:
            head = data.popleft()
            data_bytes[data_bytes_len:data_bytes_len+len(head)] = head
            data_bytes_len += len(head)

        return data_bytes

    def clear(self) -> int:
        """Clear data and return number of bytes cleared"""
        self._data.clear()
        data_len, self._data_len = self._data_len, 0
        return data_len
