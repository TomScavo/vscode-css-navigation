import {Connection, RemoteConsole} from 'vscode-languageserver'


let scopedConsole: Console | RemoteConsole = console

export function pipeTo(connection: Connection) {
	scopedConsole = connection.console
}


function getTimeMarker() {
	let date = new Date()
	
	return '['
		+ String(date.getHours())
		+ ':'
		+ String(date.getMinutes()).padStart(2, '0')
		+ ':'
		+ String(date.getSeconds()).padStart(2, '0')
		+ '] '
}

export function log(msg: string) {
	scopedConsole.log(getTimeMarker() + msg)
}

export function info(msg: string) {
	scopedConsole.info(getTimeMarker() + msg)
}

export function warn(msg: string) {
	scopedConsole.warn(getTimeMarker() + msg)
}

export function error(msg: string | Error) {
	scopedConsole.error(String(msg))
}


let startTimeMap: Map<string, number> = new Map()

function getMillisecond(): number {
	let time = process.hrtime()
	return time[0] * 1000 + time[1] / 1000000
}

export function start(name: string) {
	startTimeMap.set(name, getMillisecond())
}

export function end(name: string): number {
	let startTime = startTimeMap.get(name)
	if (startTime === undefined) {
		console.warn(`Timer "${name}" is not started`)
		return 0
	}
	startTimeMap.delete(name)
	return Math.round(getMillisecond() - startTime!)
}


type ResultsHandler<A extends any[], T> = (...args: A) => Promise<T[] | null>

export function logListReturnedFunctionExecutedTime<A extends any[], T>(fn: ResultsHandler<A, T>, type: string): ResultsHandler<A, T> {
	return async (...args: A) => {
		let startTime = getMillisecond()
		let list = await fn(...args)
		let time = Math.round(getMillisecond() - startTime!)
		
		if (list) {
			if (list.length === 0) {
				log(`No ${type} found, ${time} ms cost`)
			}
			else if (list.length === 1) {
				log(`1 ${type} found, ${time} ms cost`)
			}
			else {
				log(`${list.length} ${type}s found, ${time} ms cost`)
			}
		}

		return list
	}
}