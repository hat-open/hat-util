#ifndef HAT_ALLOCATOR_H
#define HAT_ALLOCATOR_H

/*! \file
    \brief Memory allocator
 */

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct hat_allocator_t hat_allocator_t;

/*! \brief Custom allocator implementation function
    \param[in] a allocator instance
    \param[in] size new memory block size
    \param[in] old previous memory block
    \return new memory block

    Function should implement memory allocator which reallocates previously
    allocated memory pointed by `old` to newly return memory of size `size`.
    If `old` is ``NULL``, then implementation allocates new memory block
    without resizing/copying previous. If `size` is set to ``0``, memory
    referenced by `old` is fried and ``NULL`` is returned.
 */
typedef void *(*hat_allocator_realloc_t)(hat_allocator_t *a, size_t size,
                                         void *old);

/*! \brief Allocator base struct

    If custom allocator defines new struct definition, it should embed this
    struct as frst element.
 */
struct hat_allocator_t {
    /** \brief custom realloc implementation */
    hat_allocator_realloc_t realloc;
};


/*! \brief Allocate new memory block
    \param[in] a allocator instance
    \param[in] size new memory block size
    \return new memory block

    If memory could not be allocated, ``NULL`` is returned.
 */
static inline void *hat_allocator_alloc(hat_allocator_t *a, size_t size) {
    return a->realloc(a, size, NULL);
}

/*! \brief Reallocate existing memory block
    \param[in] a allocator instance
    \param[in] size new memory block size
    \param[in] old existing memory block
    \return new memory block

    If memory could not be reallocated, ``NULL`` is returned.
 */
static inline void *hat_allocator_realloc(hat_allocator_t *a, size_t size,
                                          void *old) {
    return a->realloc(a, size, old);
}

/*! \brief Free memory block
    \param[in] a allocator instance
    \param[in] old existing memory block
 */
static inline void hat_allocator_free(hat_allocator_t *a, void *old) {
    a->realloc(a, 0, old);
}

#ifdef __cplusplus
}
#endif

#endif
