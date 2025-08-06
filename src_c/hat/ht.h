#ifndef HAT_HT_H
#define HAT_HT_H

/*! \file
    \brief Hash table

    This hash table implementation stores copies of key data and value
    pointers.
 */

#include <stddef.h>
#include <stdint.h>
#include "allocator.h"

#define HAT_HT_SUCCESS 0
#define HAT_HT_ERROR (-1)

#ifdef __cplusplus
extern "C" {
#endif

/*! \brief Hash table */
typedef struct hat_ht_t hat_ht_t;

/*! \brief Hash table iterator */
typedef void *hat_ht_iter_t;


/*! \brief Create new hash table
    \param[in] a allocator
    \return table or ``NULL`` on failure
 */
hat_ht_t *hat_ht_create(hat_allocator_t *a);

/*! \brief Destroy hash table
    \param[in] t table
 */
void hat_ht_destroy(hat_ht_t *t);

/*! \brief Number of elements in table
    \param[in] t table
    \return elements count
 */
size_t hat_ht_count(hat_ht_t *t);

/*! \brief Set element in table
    \param[in] t table
    \param[in] key key
    \param[in] key_size key size
    \param[in] value value
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``

    If key already exist, value is overridden.
 */
int hat_ht_set(hat_ht_t *t, void *key, size_t key_size, void *value);

/*! \brief Get element from table
    \param[in] t table
    \param[in] key key
    \param[in] key_size key size
    \return value or ``NULL`` on failure
 */
void *hat_ht_get(hat_ht_t *t, void *key, size_t key_size);

/*! \brief Pop element from table
    \param[in] t table
    \param[in] key key
    \param[in] key_size key size
    \return value or ``NULL`` on failure
 */
void *hat_ht_pop(hat_ht_t *t, void *key, size_t key_size);

/*! \brief Delete element from table
    \param[in] t table
    \param[in] key key
    \param[in] key_size key size
    \return ``HAT_HT_SUCCESS`` or ``HAT_HT_ERROR``
 */
int hat_ht_del(hat_ht_t *t, void *key, size_t key_size);

/*! \brief Get next iterator position
    \param[in] t table
    \param[in] prev previous iterator position
    \return iterator or ``NULL``

    If `prev` is ``NULL``, new iterator points to first entry. If all
    entries are iterated, ``NULL`` is returned.
 */
hat_ht_iter_t hat_ht_iter_next(hat_ht_t *t, hat_ht_iter_t prev);

/*! \brief Get current key
    \param[in] i iterator
    \return key
 */
void *hat_ht_iter_key(hat_ht_iter_t i);

/*! \brief Get current key size
    \param[in] i iterator
    \return key size
 */
size_t hat_ht_iter_key_size(hat_ht_iter_t i);

/*! \brief Get current value
    \param[in] i iterator
    \return value
 */
void *hat_ht_iter_value(hat_ht_iter_t i);

#ifdef __cplusplus
}
#endif
#endif
