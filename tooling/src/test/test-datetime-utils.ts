const assert = require("chai").assert
const { equal } = assert

import { plusDateTime } from "../datetime-utils"


describe("plusDateTime", () => {

    it("2021-11-05", () => {
        equal(
            plusDateTime("2021-11-05", 1, "month"),
            "2021-12-05"
        )
    })

    it("2021-11-05T01:23:45+06:07", () => {
        equal(
            plusDateTime("2021-11-05T01:23:45+06:07", 1, "month"),
            "2021-12-05T01:23:45+06:07"
        )
    })

})


describe("date arithmetic", () => {

    it("should add months", () => {
        const date = new Date("2021-11-05")
        date.setUTCMonth(date.getUTCMonth() + 1)
        equal(date.toISOString(), "2021-12-05T00:00:00.000Z")
    })

})

