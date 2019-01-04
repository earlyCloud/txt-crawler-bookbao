const fs = require('fs')
const request = require('request')

module.exports = function sevenCrawler(url, options){
	let dOptions = {
		dist: './dist', 
		limit: 500, 
		filename: 'severCrawler',
		filter: 'seven'
	}
	options && Object.assign(dOptions, options)
	request(url, function(err, res, body){
		if(err){
			console.log('err', err)
		}else{
			console.log(res.statusCode)
			if(res.statusCode === 200){
				console.log(`=> ${ dOptions.filename } downloaded`)
				if(!fs.existsSync(dOptions.dist)){
					fs.mkdirSync(dOptions.dist)
				}
				let string = res.body.toString().replace(/[\r\n]/gmi, '')
				let reg = new RegExp(`.{${ dOptions.limit }}${ dOptions.filter }.{${ dOptions.limit }}`, 'gmi')
				let matched = string.match(reg)
				if(matched){
					let filtedString = matched.join('\r\r')
					fs.createWriteStream(`${ dOptions.dist }/${ dOptions.filename }.txt`).write(res.body)
					fs.createWriteStream(`${ dOptions.dist }/${ dOptions.filename }.seven.txt`).write(filtedString)
				}else{
					fs.createWriteStream(`${ dOptions.dist }/${ dOptions.filename }.txt`).write(res.body)
				}
			}else{
				console.log("???", dOptions.filename, res.statusCode)
			}
		}
	})
}