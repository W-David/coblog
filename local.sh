#!/bin/bash
function local_opt() {
		if [ -f 'dist.zip' ]
		then 
		echo '删除已存在的dist文件'
		rm ./dist.zip
		fi
    echo '压缩服务端文件'
    7z a -tzip ./dist.zip ./*
		echo '上传dist文件'
    scp ./dist.zip ali:/root/server/temp
    echo '删除dist文件'
    rm ./dist.zip
}

echo '开始发布'
local_opt
echo '已上传到服务器'