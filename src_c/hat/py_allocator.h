#ifndef HAT_PY_ALLOCATOR_H
#define HAT_PY_ALLOCATOR_H

/*! \file
    \brief CPython memory allocator
 */

#include "allocator.h"

#ifdef __cplusplus
extern "C" {
#endif

/** \brief allocator instance */
extern hat_allocator_t hat_py_allocator;

#ifdef __cplusplus
}
#endif

#endif
