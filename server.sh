#!/bin/bash
server_opt() {
	echo '开始备份'
	echo '跳转到 ~/server/temp'
	cd ~/server/temp
	if [ -f 'dist.zip' ]
	then
		current_time=$(date '+%Y%m%d%H')
		echo '存在dist.zip文件'
		echo "生成文件dist.zip.$current_time"
		cp ./dist.zip ./pkg/dist.zip.$current_time
		if [ -d 'dist']
		then 
			echo '删除已存在的dist文件夹'
			rm -rf ./dist
			md dist
		fi
		echo '解压dist.zip文件'
		unzip ./dist.zip -d dist
		echo '删除dist.zip文件'
		rm ./dist.zip
	fi
	if [ -e 'dist' ]
	then
		echo '存在dist文件夹'
		echo '停止并删除服务 coblog-service waline-service'
		pm2 delete coblog-service
		pm2 delete waline-service
		echo '跳转到 ~/server'
		cd ~/server/
		echo '删除旧的部署文件'
		rm -rf ./coblog
		echo '放置新的部署文件'
		mv ~/server/temp/dist ./
		mv dist coblog
		echo '启动 coblog-service'
		echo '跳转到 ~/server/coblog'
		cd ~/server/coblog
		npm run start
		echo '启动 waline-service'
		echo '跳转到 ~/server/coblog/waline'
		cd ~/server/coblog/waline
		npm run start
	else
		echo '不存在dist文件夹'
		echo '重启服务 coblog-service waline-service'
		pm2 restart coblog-service
		pm2 restart waline-service
	fi
}

echo '开始部署'
server_opt
echo '部署完成'