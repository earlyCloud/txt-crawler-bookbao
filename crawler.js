const fs = require('fs')
const request = require('request')
const Crawler = require('crawler')
const cheerio = require('cheerio')
const sevenCrawler = require('./sevenCrawler.js')

const dist = process.argv.slice(2)[0]

const host = 'https://www.bookbao99.net'
const args = process.argv.slice(2)
const queryString = `q_${encodeURI(escape(args[0]))}`

let page = 1, latestDownloadPageLink = []
searchBook(`${host}/search-p_${page}-${queryString}-o_0.html`)

function searchBook(url){
	const crawler = new Crawler({
		jQuery: 'cheerio',
		maxConnections: 10,
		rateLimit: 50000, //慢速模式
		headers: {
			'Host': 'www.bookbao99.net',
			'Referer': 'https://www.bookbao99.net',
			'Upgrade-Insecure-Requests': 1,
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0'
		},
		callback(err, res, done){
			if(err){
				console.log('err', err)
			}else{
				if(res.statusCode === 200){
					const $ = res.$
					let $searchbox = $('.search_box')
					let $list = $searchbox.find('ul > li')
					let downloadPagelink = []
					$list.each(function(index, item){
						let href = `${host}${$(item).find('.t > a').attr('href')}`
						href = href.replace(/\/book\//g, '/down/')
						downloadPagelink.push(href)
					})
					if(isArrEqual(latestDownloadPageLink, downloadPagelink)){
						console.log('no more list')
					}else{
						page ++ 
						latestDownloadPageLink = downloadPagelink
						console.log(downloadPagelink)
						getDownloadPage(downloadPagelink)
						searchBook(`${host}/search-p_${page}-${queryString}-o_0.html`)
					}
				}else{
					console.log(res.statusCode)
				}
			}
			done()
		}
	})
	crawler.queue(url)
}

function getDownloadPage(downloadPagelink){
	const crawler = new Crawler({
		jQuery: 'cheerio',
		maxConnections: 10,
		rateLimit: 10000, //慢速模式
		headers: {
			'Host': 'www.bookbao99.net',
			'Referer': 'https://www.bookbao99.net',
			'Upgrade-Insecure-Requests': 1,
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0'
		},
		callback(err, res, done){
			if(err){
				console.log('err', err)
			}else{
				if(res.statusCode === 200){
					const $ = res.$
					const $infoButton = $('.info_buttondiv')
					const downloadLink = $($infoButton[0]).find('a').attr('href')
					let bookname = $('.book_author a:last-child').text()
					downloadLink && downloadBook(downloadLink, bookname)
				}else{
					console.log(res.statusCode)
				}
			}
			done()
		}
	})
	crawler.queue(downloadPagelink)
}

function downloadBook(url, bookname){
	console.log(url, bookname)
	sevenCrawler(url, {
		filename: bookname,
		dist: './seven',
		filter: args[1]
	})
}



function isArrEqual(arr1, arr2){
	if(!Array.isArray(arr1)) throw new TypeError('Expected Array, got ' + (typeof arr1))
	let check = true
	for(var i = 0; i < arr1.length; i++){
		if(arr1[i] !== arr2[i]){
			check = false
			break
		}
	}
	arr2[i] && (check = false)
	return check
}