#include "allocator.h"
#define PY_SSIZE_T_CLEAN
#include <Python.h>


static void *py_realloc(hat_allocator_t *a, size_t size, void *old) {
    if (size)
        return PyMem_Realloc(old, size);
    PyMem_Free(old);
    return NULL;
}


hat_allocator_t hat_py_allocator = {.ctx = NULL, .realloc = py_realloc};