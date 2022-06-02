#include "libc_allocator.h"
#include <stdlib.h>


static void *libc_realloc(hat_allocator_t *a, size_t size, void *old) {
    if (size)
        return realloc(old, size);
    free(old);
    return NULL;
}


hat_allocator_t hat_libc_allocator = {.ctx = NULL, .realloc = libc_realloc};
