#ifndef HAT_BUFF_H
#define HAT_BUFF_H

/*! \file
    \brief Data buffer

    Data buffer is simple byte storage with associated size (capacity) and
    position pointer.

    If used as data source, position points to location which is not yet
    consumed.

    If used as data storage, position points to location where next byte
    should be stored.
 */

#include <stdint.h>
#include <string.h>

#define HAT_BUFF_SUCCESS 0
#define HAT_BUFF_ERROR 1

#ifdef __cplusplus
extern "C" {
#endif

/*! \brief Data buffer */
typedef struct {
    /** \brief data */
    uint8_t *data;
    /** \brief buffer size */
    size_t size;
    /** \brief current position */
    size_t pos;
} hat_buff_t;


/*! \brief Available capacity
    \param[in] buff buffer instance
    \return size

    Returns difference between size and current position or ``0`` if current
    position is greater or equal to size.
 */
static inline size_t hat_buff_available(hat_buff_t *buff) {
    return (buff && buff->size > buff->pos) ? buff->size - buff->pos : 0;
}

/*! \brief Write data to buffer
    \param[in] buff buffer instance
    \param[in] data data
    \param[in] data_len data length
    \return ``HAT_BUFF_SUCCESS`` or ``HAT_BUFF_ERROR``

    Data is written to buffer starting from current position. Position
    is incremented if data is successfully written.
 */
static inline int hat_buff_write(hat_buff_t *buff, uint8_t *data,
                                 size_t data_len) {
    if (hat_buff_available(buff) < data_len)
        return HAT_BUFF_ERROR;
    memcpy(buff->data + buff->pos, data, data_len);
    buff->pos += data_len;
    return HAT_BUFF_SUCCESS;
}

/*! \brief Read data from buffer
    \param[in] buff buffer instance
    \param[in] size data size
    \return data

    Returned data pointer points to buffered data starting from current
    position. If buffer available capacity is smaller than requested size,
    ``NULL`` is returned. Position is incremented if data is successfully read.
 */
static inline uint8_t *hat_buff_read(hat_buff_t *buff, size_t size) {
    if (hat_buff_available(buff) < size)
        return NULL;
    uint8_t *data = buff->data + buff->pos;
    buff->pos += size;
    return data;
}

#ifdef __cplusplus
}
#endif

#endif
