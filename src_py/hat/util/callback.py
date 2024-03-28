from collections.abc import Callable
import typing


class RegisterCallbackHandle(typing.NamedTuple):
    """Handle for canceling callback registration."""

    cancel: Callable[[], None]
    """cancel callback registration"""

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.cancel()


ExceptionCb: typing.TypeAlias = Callable[[Exception], None]
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
                 cb: Callable
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
