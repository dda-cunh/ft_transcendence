#!/bin/bash

redis_conf="./redis.conf"

if [ ! -f $redis_conf ]; then
	echo "bind 0.0.0.0" >> $redis_conf
	echo "port $RE_PORT" >> $redis_conf
	echo "save $RE_CHECK_SECS $RE_CHECK_OPS" >> $redis_conf
	echo "daemonize no" >> $redis_conf
fi

redis-server $redis_conf --requirepass "$RE_PASS"

#check connection 'redis-cli -p $RE_PORT --pass $RE_PASS ping'
