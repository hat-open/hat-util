#include "socket.h"

#ifndef _WIN32
#include <fcntl.h>
#endif


int hat_socket_setup() {
#ifdef _WIN32
    WSADATA wsa_data;
    return WSAStartup(MAKEWORD(2, 2), &wsa_data) ? HAT_SOCKET_ERROR
                                                 : HAT_SOCKET_SUCCESS;
#else
    return HAT_SOCKET_SUCCESS;
#endif
}


void hat_socket_cleanup() {
#ifdef _WIN32
    WSACleanup();
#endif
}


int hat_socket_addr_resolve(char *name, hat_socket_ip4_addr_t *host) {
    struct addrinfo *res;
    struct addrinfo hints = {.ai_family = AF_INET};

    if (getaddrinfo(name, NULL, &hints, &res))
        return HAT_SOCKET_ERROR;

    if (res->ai_addr->sa_family != AF_INET) {
        freeaddrinfo(res);
        return HAT_SOCKET_ERROR;
    }

    *host = ntohl(((struct sockaddr_in *)res->ai_addr)->sin_addr.s_addr);
    freeaddrinfo(res);
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_addr_convert(char *addr, hat_socket_ip4_addr_t *host) {
    struct sockaddr_in res;
    if (inet_aton(addr, &res))
        return HAT_SOCKET_ERROR;

    *host = ntohl(res.sin_addr.s_addr);
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_open(hat_socket_t *s, int type) {
    int domain;
    int sock_type;
    int protocol;

    if (type == HAT_SOCKET_TYPE_IP4_TCP) {
        domain = AF_INET;
        sock_type = SOCK_STREAM;
        protocol = IPPROTO_TCP;

    } else if (type == HAT_SOCKET_TYPE_IP4_UDP) {
        domain = AF_INET;
        sock_type = SOCK_DGRAM;
        protocol = IPPROTO_UDP;

    } else {
        return HAT_SOCKET_ERROR;
    }

    s->type = type;
    s->socket = socket(domain, sock_type, protocol);
    s->local_host = 0;
    s->local_port = 0;
    s->remote_host = 0;
    s->remote_port = 0;

#ifdef _WIN32
    return (s->socket == INVALID_SOCKET) ? HAT_SOCKET_ERROR
                                         : HAT_SOCKET_SUCCESS;
#else
    return (s->socket < 0) ? HAT_SOCKET_ERROR : HAT_SOCKET_SUCCESS;
#endif
}


int hat_socket_close(hat_socket_t *s) {
    int status = HAT_SOCKET_SUCCESS;
#ifdef _WIN32
    if (shutdown(s->socket, SD_BOTH))
        status = HAT_SOCKET_ERROR;
    if (closesocket(s->socket))
        status = HAT_SOCKET_ERROR;
#else
    if (shutdown(s->socket, SHUT_RDWR))
        status = HAT_SOCKET_ERROR;
    if (close(s->socket))
        status = HAT_SOCKET_ERROR;
#endif
    return status;
}


int hat_socket_set_blocking(hat_socket_t *s, bool blocking) {
#ifdef _WIN32
    unsigned long arg = blocking ? 0 : 1;
    return ioctlsocket(s->socket, FIONBIO, &mode) ? HAT_SOCKET_ERROR
                                                  : HAT_SOCKET_SUCCESS;
#else
    int flags = fcntl(s->socket, F_GETFL, 0);
    if (flags < 0)
        return HAT_SOCKET_ERROR;
    if (blocking)
        flags &= ~O_NONBLOCK;
    else
        flags |= O_NONBLOCK;
    return (fcntl(s->socket, F_SETFL, flags) == -1) ? HAT_SOCKET_ERROR
                                                    : HAT_SOCKET_SUCCESS;
#endif
}


int hat_socket_connect(hat_socket_t *s, hat_socket_ip4_addr_t host,
                       hat_socket_port_t port) {
    struct sockaddr_in addr = {.sin_family = AF_INET,
                               .sin_port = htons(port),
                               .sin_addr = {.s_addr = htonl(host)}};

    if (connect(s->socket, &addr, sizeof(addr)))
        return HAT_SOCKET_ERROR;

    if (getsockname(s->socket, &addr, sizeof(addr)))
        return HAT_SOCKET_ERROR;

    s->local_host = ntohl(addr.sin_addr.s_addr);
    s->local_port = ntohs(addr.sin_port);
    s->remote_host = host;
    s->remote_port = port;
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_bind(hat_socket_t *s, hat_socket_ip4_addr_t host,
                    hat_socket_port_t port) {
    struct sockaddr_in addr = {.sin_family = AF_INET,
                               .sin_port = htons(port),
                               .sin_addr = {.s_addr = htonl(host)}};

    if (bind(s->socket, &addr, sizeof(addr)))
        return HAT_SOCKET_ERROR;

    s->local_host = host;
    s->local_port = port;
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_listen(hat_socket_t *s, int backlog) {
    if (listen(s->socket, backlog))
        return HAT_SOCKET_ERROR;

    return HAT_SOCKET_SUCCESS;
}


int hat_socket_accept(hat_socket_t *s, hat_socket_t *client) {
    struct sockaddr_in addr;
    client->socket = accept(s->socket, &addr, sizeof(addr));

#ifdef _WIN32
    if (s->socket == INVALID_SOCKET)
        return HAT_SOCKET_ERROR;
#else
    if (s->socket < 0)
        return HAT_SOCKET_ERROR;
#endif

    client->type = s->type;
    client->remote_host = ntohl(addr.sin_addr.s_addr);
    client->remote_port = ntohs(addr.sin_port);

    if (getsockname(client->socket, &addr, sizeof(addr))) {
        hat_socket_close(client);
        return HAT_SOCKET_ERROR;
    }

    s->local_host = ntohl(addr.sin_addr.s_addr);
    s->local_port = ntohs(addr.sin_port);
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_send(hat_socket_t *s, hat_buff_t *data) {
    ssize_t res = send(s->socket, data->data, hat_buff_available(data), 0);
    if (res < 0)
        return HAT_SOCKET_ERROR;

    data->pos += res;
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_send_to(hat_socket_t *s, hat_buff_t *data,
                       hat_socket_ip4_addr_t host, hat_socket_port_t port) {
    struct sockaddr_in addr = {.sin_family = AF_INET,
                               .sin_port = htons(port),
                               .sin_addr = {.s_addr = htonl(host)}};

    ssize_t res = sendto(s->socket, data->data, hat_buff_available(data), 0,
                         &addr, sizeof(addr));
    if (res < 0)
        return HAT_SOCKET_ERROR;

    data->pos += res;
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_receive(hat_socket_t *s, hat_buff_t *data) {
    size_t available = hat_buff_available(data);
    if (!available)
        return HAT_SOCKET_ERROR;

    ssize_t res = recv(s->socket, data->data + data->pos, available, 0);
    if (res < 0)
        return HAT_SOCKET_ERROR;

    data->pos += res;
    return HAT_SOCKET_SUCCESS;
}


int hat_socket_receive_from(hat_socket_t *s, hat_buff_t *data,
                            hat_socket_ip4_addr_t host,
                            hat_socket_port_t port) {
    size_t available = hat_buff_available(data);
    if (!available)
        return HAT_SOCKET_ERROR;

    struct sockaddr_in addr = {.sin_family = AF_INET,
                               .sin_port = htons(port),
                               .sin_addr = {.s_addr = htonl(host)}};

    ssize_t res = recvfrom(s->socket, data->data + data->pos, available, 0,
                           &addr, sizeof(addr));
    if (res < 0)
        return HAT_SOCKET_ERROR;

    data->pos += res;
    return HAT_SOCKET_SUCCESS;
}
