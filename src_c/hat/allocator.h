#ifndef HAT_ALLOCATOR_H
#define HAT_ALLOCATOR_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct hat_allocator_t hat_allocator_t;

typedef void *(*hat_allocator_realloc_t)(hat_allocator_t *a, size_t size,
                                         void *old);

struct hat_allocator_t {
    hat_allocator_realloc_t realloc;
};


static inline void *hat_allocator_alloc(hat_allocator_t *a, size_t size) {
    return a->realloc(a, size, NULL);
}

static inline void *hat_allocator_realloc(hat_allocator_t *a, size_t size,
                                          void *old) {
    return a->realloc(a, size, old);
}

static inline void hat_allocator_free(hat_allocator_t *a, void *old) {
    a->realloc(a, 0, old);
}

#ifdef __cplusplus
}
#endif

#endif
