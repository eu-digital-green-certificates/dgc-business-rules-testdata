import { TimeUnit } from "certlogic-js"


const msInDay = 1000*60*60*24
export const ms2days = (ms: number) => Math.floor(ms/msInDay)
const msInMonth = msInDay*31
export const ms2months = (ms: number) => Math.floor(ms/msInMonth)


const leftPad = (strOrNum: string | number, len: number, char: string): string => {
    const str = typeof strOrNum === "number" ? ("" + strOrNum) : strOrNum
    return char.repeat(len - str.length) + str
}


const plusDateTimeInternal = (dateTime: Date, amount: number, unit: TimeUnit) => {
           if (unit === "day") {
        dateTime.setUTCDate(dateTime.getUTCDate() + amount)
    } else if (unit === "hour") {
        dateTime.setUTCHours(dateTime.getUTCHours() + amount)
    } else if (unit === "month") {
        dateTime.setUTCMonth(dateTime.getUTCMonth() + amount)
    } else if (unit === "year") {
        const wasMonth = dateTime.getUTCMonth()
        dateTime.setUTCFullYear(dateTime.getUTCFullYear() + amount)
        if (dateTime.getUTCMonth() > wasMonth) {
            dateTime.setUTCDate(dateTime.getUTCDay() - 1)
        }
    }
}


const dateAsString = (date: Date) => `${leftPad(date.getFullYear(), 4, "0")}-${leftPad(date.getMonth() + 1, 2, "0")}-${leftPad(date.getDate(), 2, "0")}`
const timeAsString = (time: Date) => `${leftPad(time.getHours(), 2, "0")}:${leftPad(time.getMinutes(), 2, "0")}:${leftPad(time.getSeconds(), 2, "0")}`
const timezoneOffsetAsString = (time: Date) => {
    const tzo = time.getTimezoneOffset()
    return `${tzo < 0 ? "-" : "+"}${leftPad(Math.floor(tzo/60), 2, "0")}:${leftPad(tzo%60, 2, "0")}`
}

export const plusDateTime = (dateTimeStr: string, amount: number, unit: TimeUnit): string => {
    const dateMatch = dateTimeStr.match(/^\d{4}-\d{2}-\d{2}$/)
    if (dateMatch) {
        const date = new Date(dateTimeStr)
        plusDateTimeInternal(date, amount, unit)
        return dateAsString(date)
    }
    const dateTimeMatch = dateTimeStr.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(Z|([+-]\d{2}:\d{2}))?$/)
    if (dateTimeMatch) {
        const dateTime = new Date(dateTimeMatch[1])
        plusDateTimeInternal(dateTime, amount, unit)
        return `${dateAsString(dateTime)}T${timeAsString(dateTime)}${dateTimeMatch[2] || ""}`
    }
    throw new Error(`can't parse "${dateTimeStr}" as date(time)`)
}


// TODO  reuse more from certlogic-js/internals, for automatic alignment

